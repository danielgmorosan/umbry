import { useRef, useState, type DragEvent } from "react";

/**
 * Drag-and-drop file target (T3). Spread `props` on a container and render a
 * drop overlay while `dragging` is true. Depth-counts enter/leave so child
 * elements don't flicker the state off.
 */
export function useFileDrop(onFiles: (files: FileList) => void) {
  const [dragging, setDragging] = useState(false);
  const depth = useRef(0);

  const hasFiles = (e: DragEvent) => e.dataTransfer?.types?.includes("Files");

  const props = {
    onDragEnter: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      e.preventDefault();
      depth.current += 1;
      setDragging(true);
    },
    onDragOver: (e: DragEvent) => {
      if (hasFiles(e)) e.preventDefault(); // required, or the browser navigates to the file
    },
    onDragLeave: (e: DragEvent) => {
      if (!hasFiles(e)) return;
      depth.current = Math.max(0, depth.current - 1);
      if (depth.current === 0) setDragging(false);
    },
    onDrop: (e: DragEvent) => {
      depth.current = 0;
      setDragging(false);
      if (!e.dataTransfer?.files?.length) return;
      e.preventDefault();
      onFiles(e.dataTransfer.files);
    },
  };

  return { dragging, props };
}
