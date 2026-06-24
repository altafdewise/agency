export type WorkTeaserMediaItem = {
  id: string;
  type: "image" | "video";
  src: string;
  alt: string;
  column: 1 | 2 | 3;
  ready: boolean;
  poster?: string;
};

export const WORK_TEASER_MEDIA: WorkTeaserMediaItem[] = [
  // TODO: replace these placeholder slots with real portrait work media.
  // TODO: when a matching file exists in /public/work/teaser, set ready to true.
  {
    id: "teaser-01",
    type: "image",
    src: "/work/teaser/01.jpg",
    alt: "Placeholder portrait image slot 01.",
    column: 1,
    ready: false,
  },
  {
    id: "teaser-02",
    type: "video",
    src: "/work/teaser/clip-01.mp4",
    poster: "/work/teaser/clip-01-poster.jpg",
    alt: "Placeholder portrait video slot 01.",
    column: 1,
    ready: false,
  },
  {
    id: "teaser-03",
    type: "image",
    src: "/work/teaser/02.jpg",
    alt: "Placeholder portrait image slot 02.",
    column: 1,
    ready: false,
  },
  {
    id: "teaser-04",
    type: "video",
    src: "/work/teaser/clip-02.mp4",
    poster: "/work/teaser/clip-02-poster.jpg",
    alt: "Placeholder portrait video slot 02.",
    column: 2,
    ready: false,
  },
  {
    id: "teaser-05",
    type: "image",
    src: "/work/teaser/03.jpg",
    alt: "Placeholder portrait image slot 03.",
    column: 2,
    ready: false,
  },
  {
    id: "teaser-06",
    type: "image",
    src: "/work/teaser/04.jpg",
    alt: "Placeholder portrait image slot 04.",
    column: 2,
    ready: false,
  },
  {
    id: "teaser-07",
    type: "image",
    src: "/work/teaser/05.jpg",
    alt: "Placeholder portrait image slot 05.",
    column: 3,
    ready: false,
  },
  {
    id: "teaser-08",
    type: "video",
    src: "/work/teaser/clip-03.mp4",
    poster: "/work/teaser/clip-03-poster.jpg",
    alt: "Placeholder portrait video slot 03.",
    column: 3,
    ready: false,
  },
  {
    id: "teaser-09",
    type: "image",
    src: "/work/teaser/06.jpg",
    alt: "Placeholder portrait image slot 06.",
    column: 3,
    ready: false,
  },
];
