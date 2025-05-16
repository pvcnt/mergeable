/**
 * Provides necessary initialization for react-time-ago.
 */
import TimeAgo from "javascript-time-ago";
import timeAgoEnLocale from "javascript-time-ago/locale/en.json";
import ReactTimeAgo from "react-time-ago";

TimeAgo.addDefaultLocale(timeAgoEnLocale);

export default ReactTimeAgo;
