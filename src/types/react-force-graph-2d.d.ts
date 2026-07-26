declare module "react-force-graph-2d" {
  import type { ComponentType } from "react";

  type ForceGraphProps = {
    graphData?: {
      nodes: object[];
      links: object[];
    };
    nodeLabel?: string;
    nodeAutoColorBy?: string;
    linkDirectionalArrowLength?: number;
    width?: number;
    height?: number;
  };

  const ForceGraph2D: ComponentType<ForceGraphProps>;
  export default ForceGraph2D;
}
