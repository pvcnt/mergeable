import type { Attention, PullProps, Connection } from "@repo/model";
import { PullState, CheckState } from "@repo/model";

export function isInAttentionSet(connection: Connection, pull: PullProps): Attention {
    if (pull.state === PullState.Draft || pull.state === PullState.Merged || pull.state === PullState.Closed) {
        // Draft, merged and closed pull requests have no attention set.
        return { set: false };
    }

    const viewerName = connection.viewer?.user.name
    const viewerTeams = new Set(connection.viewer?.teams.map(r => r.name));

    const isAuthor = pull.author.name === viewerName;
    const isApproved = pull.state === PullState.Approved;
    const isReviewer = pull.reviews.some(r => r.author?.name === viewerName);
    const isRequestedReviewer = pull.requestedReviewers.some(r => r.name === viewerName)
      || pull.requestedTeams.some(r => viewerTeams.has(r.name));

    if (!isAuthor && !isReviewer && !isRequestedReviewer) {
        // Only authors and reviewers can be in the attention set.
        return { set: false };
    }

    const reviewerNames = new Set(pull.reviews.map(r => r.author?.name));
    const commenterNames = new Set<string>();
    for (const discussion of pull.discussions) {
        if (discussion.resolved) {
            // Resolved discussions are ignored.
            continue;
        }
        const lastViewerCommentPos = discussion.comments.findLastIndex(c => c.author?.name === viewerName);
        const commentsAfterLastViewerComment = (lastViewerCommentPos === -1) 
            ? discussion.comments 
            : discussion.comments.slice(lastViewerCommentPos + 1);
        if (lastViewerCommentPos > -1 && commentsAfterLastViewerComment.length > 0) {
            // The author and reviewers are always notified when somebody replied to them.
            commentsAfterLastViewerComment
                .filter(c => c.author?.name !== viewerName)
                .forEach(c => commenterNames.add(c.author?.name ?? "Anonymous"));
        } else if (isAuthor) {
            // The author (and only them) is notified when a reviewer left a comment in any thread,
            // even if the author did not participate in this thread.
            commentsAfterLastViewerComment
                .filter(c => reviewerNames.has(c.author?.name))
                .forEach(c => commenterNames.add(c.author?.name ?? "Anonymous"));
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
    } else if (isAuthor && (pull.ciState == CheckState.Error || pull.ciState == CheckState.Failure)) {
        // The author (and only them) is in the attention set if a CI check is failing.
        return { set: true, reason: "CI is failing" };
    } else if (isAuthor && isApproved) {
        // The author (and only them) is in the attention set of an approved pull request, because it
        // now has to merge it.
        return { set: true, reason: "Pull request is approved" };
    } else if (isRequestedReviewer && !isApproved) {
        // A requested reviewer is part of the attention set if the pull request is not already approved.
        return { set: true, reason: "Review is requested" };
    } else {
        return { set: false };
    }
}