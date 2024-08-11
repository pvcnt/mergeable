import { type PullProps, type Comment, type Connection, PullState } from "@repo/types";
import { GitHubClient } from "./client";

export type Attention = {
    set: boolean
    reason?: string
}

export async function isInAttentionSet(client: GitHubClient, connection: Connection, pull: PullProps): Promise<Attention> {
    if (pull.state === PullState.Draft || pull.state === PullState.Merged || pull.state === PullState.Closed) {
        // Draft, merged and closed pull requests are never in the attention set.
        return { set: false };
    }

    const viewerName = connection.viewer?.user.name
    const viewerTeams = new Set(connection.viewer?.teams.map(r => r.name));

    const isAuthor = pull.author.name === viewerName;
    const isReviewer = pull.requestedReviewers.some(r => r.name === viewerName)
      || pull.requestedTeams.some(r => viewerTeams.has(r.name))
      || pull.reviewers.some(r => r.name === viewerName);

    if (!isAuthor && !isReviewer) {
        // Only authors and reviewers are in the attention set.
        return { set: false };
    }
    if (pull.state === PullState.Approved) {
        // The author (and only them) is in the attention of an approved pull request.
        return isAuthor ? { set: true, reason: "Pull request is approved" } : { set: false };
    }

    const comments = await client.getComments(connection, pull.repo, pull.number);
    const threads = groupByThread(comments);

    const reviewerNames = new Set(pull.reviewers.map(r => r.name));
    for (const thread of threads) {
        if (thread.every(c => c.author.name === pull.author.name)) {
            // Threads containing only comments from the author are ignored.
            continue;
        }
        const lastViewerCommentPos = thread.findIndex(c => c.author.name === viewerName);
        const commentsAfterLastViewerComment = (lastViewerCommentPos === -1) 
            ? comments 
            : comments.slice(lastViewerCommentPos + 1);
        if (lastViewerCommentPos > -1 && commentsAfterLastViewerComment.length > 0) {
            // Authors and reviewers are always notified when somebody replied to them.
            return { set: true, reason: "A user left a comment" };
        } else if (isAuthor && commentsAfterLastViewerComment.some(c => reviewerNames.has(c.author.name))) {
            // Authors are notified when a reviewer left a comment in any thread, even if
            // the author did not participate in this thread.
            return { set: true, reason: "A user left a comment" };
        }
    }
    return { set: false };
}

function groupByThread(comments: Comment[]): Comment[][] {
    const threadByComment: Record<string, string> = {};
    const threads: Record<string, Comment[]> = {};
    for (const comment of comments) {
        if (comment.inReplyTo === undefined) {
            threads[comment.uid] = [comment];
            threadByComment[comment.uid] = comment.uid;
        } else {
            const thread = threadByComment[comment.inReplyTo];
            threads[thread].push(comment);
            threadByComment[comment.uid] = thread;
        }
    }
    return Object.values(threads);
}