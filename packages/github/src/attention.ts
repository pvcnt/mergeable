import { type Attention, type PullProps, type Comment, type Connection, PullState } from "@repo/model";
import { GitHubClient } from "./client.js";

export async function isInAttentionSet(client: GitHubClient, connection: Connection, pull: PullProps): Promise<Attention> {
    if (pull.state === PullState.Draft || pull.state === PullState.Merged || pull.state === PullState.Closed) {
        // Draft, merged and closed pull requests have no attention set.
        return { set: false };
    }

    const viewerName = connection.viewer?.user.name
    const viewerTeams = new Set(connection.viewer?.teams.map(r => r.name));

    const isAuthor = pull.author.name === viewerName;
    const isApproved = pull.state === PullState.Approved;
    const isReviewer = pull.reviewers.some(r => r.name === viewerName);
    const isRequestedReviewer = pull.requestedReviewers.some(r => r.name === viewerName)
      || pull.requestedTeams.some(r => viewerTeams.has(r.name));

    if (!isAuthor && !isReviewer && !isRequestedReviewer) {
        // Only authors and reviewers can be in the attention set.
        return { set: false };
    }

    const comments = await client.getComments(connection, pull.repo, pull.number);
    const threads = groupByThread(comments);

    const reviewerNames = new Set(pull.reviewers.map(r => r.name));
    const commenterNames = new Set<string>();
    for (const thread of threads) {
        if (thread.every(c => c.author.name === pull.author.name)) {
            // Threads containing only comments from the author are ignored. They are usually
            // part of the initial remarks left by the author. If nobody replied, we consider
            // they do not refer to any action to take.
            continue;
        }
        const lastViewerCommentPos = thread.findLastIndex(c => c.author.name === viewerName);
        const commentsAfterLastViewerComment = (lastViewerCommentPos === -1) 
            ? comments 
            : comments.slice(lastViewerCommentPos + 1);
        if (lastViewerCommentPos > -1 && commentsAfterLastViewerComment.length > 0) {
            // The author and reviewers are always notified when somebody replied to them.
            commentsAfterLastViewerComment
                .filter(c => c.author.name !== viewerName)
                .forEach(c => commenterNames.add(c.author.name));
        } else if (isAuthor) {
            // The author (and only them) is notified when a reviewer left a comment in any thread,
            // even if the author did not participate in this thread.
            commentsAfterLastViewerComment
                .filter(c => reviewerNames.has(c.author.name))
                .forEach(c => commenterNames.add(c.author.name));
        }
    }
    if (commenterNames.size > 0) {
        // There have been some relevant new comments that bring the user inside the attention set.
        // Give priority to this reason for being in the attention set over all others, to encourage
        // users to have a look at comments and reply to them.
        const sortedCommenterNames = Array.from(commenterNames).sort();
        if (sortedCommenterNames.length === 1) {
            return { set: true, reason: `${sortedCommenterNames[0]} left a comment` };
        } else {
            return { set: true, reason: `${sortedCommenterNames[0]} and ${sortedCommenterNames.length - 1} other${sortedCommenterNames.length > 2 ? 's' : ''} left a comment` };
        }
    } else if (isAuthor && isApproved) {
        // The author (and only them) is in the attention of an approved pull request, because it
        // now has to merge it.
        return { set: true, reason: "Pull request is approved" };
    } else if (isRequestedReviewer && !isApproved) {
        // A requested reviewer is part of the attention set if the pull request is not already approved.
        return { set: true, reason: "Review is requested" };
    } else {
        return { set: false };
    }
}

/**
 * Group all review comments of a pull request into threads.
 * 
 * @param comments Review comments of a pull request.
 * @returns Review comments, grouped by thread (in the same order).
 */
function groupByThread(comments: Comment[]): Comment[][] {
    // `inReplyTo` contains the identifier of the first comment of a thread.
    // The first message in a thread does not have an `inReplyTo`. 
    const threads: Record<string, Comment[]> = {};
    for (const comment of comments) {
        if (comment.inReplyTo === undefined) {
            threads[comment.uid] = [comment];
        } else if (comment.inReplyTo in threads) {
            threads[comment.inReplyTo].push(comment);
        } else {
            threads[comment.inReplyTo] = [comment];
        }
    }
    return Object.values(threads);
}