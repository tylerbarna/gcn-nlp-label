import { type RouteConfig, index } from "@react-router/dev/routes";

export default [
  {
    path: "/",
    file: "routes/_index.tsx",
  },
  {
    path: "/review/:id",
    file: "routes/review.$id.tsx",
  },
];
