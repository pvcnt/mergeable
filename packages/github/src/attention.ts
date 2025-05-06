import { firstBy, prop } from "remeda";
import type { Attention, PullProps, Profile } from "./types";

// A pull request is in the attention set if:
// - The user is the author, and the pull request is approved
// - The user is the author, and there is a failing CI check
// - The user is the author, and there is an unread comment in an unresolved discussion
// - The user is the author, the pull request is not approved with unresolved discussions
// - The user is the author, the pull request is enqueued but cannot be merged
// - The user is a reviewer, and there is an unread comment in an unresolved discussion that he participated in
// - The user is a reviewer, and the pull request is not approved with no unresolved discussions
// - The user is a requested reviewer, and the pull request is not approved
export function isInAttentionSet(viewer: Profile, pull: PullProps): Attention {
  if (
    pull.state === "draft" ||
    pull.state === "merged" ||
    pull.state === "closed"
  ) {
    // Draft, merged or closed pull requests are never in the attention set.
    return { set: false };
  }
  const isAuthor = pull.author?.id === viewer.user.id;
  const viewerTeams = new Set(viewer.teams.map((t) => t.id));
  const isReviewer = pull.reviews.some(
    (r) => r.collaborator && r.author?.id === viewer.user.id,
  );
  const isRequestedReviewer =
    pull.requestedReviewers.some((r) => r.id === viewer.user.id) ||
    pull.requestedTeams.some((t) => viewerTeams.has(t.id));

  if (!isAuthor && !isReviewer && !isRequestedReviewer) {
    // Only authors and reviewers can be in the attention set.
    return { set: false };
  }

  if (pull.state === "enqueued") {
    // Enqueued pull requests are in the attention set only if they cannot be merged.
    if (isAuthor && pull.queueState === "unmergeable") {
      return { set: true, reason: "Pull request is unmergeable" };
    } else {
      return { set: false };
    }
  }

  let unreadDiscussions = 0;
  let unresolvedDiscussions = 0;
  for (const discussion of pull.discussions) {
    if (discussion.resolved) {
      // Resolved discussions are ignored.
      continue;
    }
    if (!discussion.file) {
      // Top-level discussion is ignored, since it tends to be a giant catch-all thread.
      continue;
    }
    if (
      discussion.participants.length === 1 &&
      discussion.participants[0].user.id === viewer.user.id
    ) {
      // Discussions with only comments from the author are ignored.
      continue;
    }

    unresolvedDiscussions++;

    const lastCommenter = firstBy(discussion.participants, [
      prop("lastActiveAt"),
      "desc",
    ]);
    const hasNewComments =
      lastCommenter && lastCommenter.user.id !== viewer.user.id;
    if (isAuthor && hasNewComments) {
      // The author is in the attention set if there is any new comment.
      unreadDiscussions++;
    } else if (
      isReviewer &&
      hasNewComments &&
      discussion.participants.some((p) => p.user.id === viewer.user.id)
    ) {
      // A reviewer is in the attention set if there is any new comment
      // in a discussion they participated in.
      unreadDiscussions++;
    }
  }
  if (unreadDiscussions > 0) {
    // There have been some relevant new comments that bring the user inside the attention set.
    // Give priority to this reason for being in the attention set over all others, to encourage
    // users to have a look at comments and reply to them.
    return {
      set: true,
      reason: `${unreadDiscussions} unread discussion${unreadDiscussions > 1 ? "s" : ""}`,
    };
  } else if ((isAuthor || isReviewer) && unresolvedDiscussions > 0) {
    return {
      set: true,
      reason: `${unresolvedDiscussions} unresolved discussion${unresolvedDiscussions > 1 ? "s" : ""}`,
    };
  } else if (
    isAuthor &&
    (pull.checkState === "error" || pull.checkState == "failure")
  ) {
    return { set: true, reason: "CI is failing" };
  } else if (isAuthor && pull.state === "approved") {
    return { set: true, reason: "Pull request is approved" };
  } else if (
    isReviewer &&
    pull.state !== "approved" &&
    unresolvedDiscussions === 0
  ) {
    return { set: true, reason: "Pull request is not approved" };
  } else if (isRequestedReviewer && pull.state !== "approved") {
    return { set: true, reason: "Review is requested" };
  } else {
    return { set: false };
  }
}
