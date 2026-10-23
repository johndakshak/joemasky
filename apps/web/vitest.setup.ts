import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import { afterEach } from "vitest";
import { createElement } from "react";

// Mock next/image — jsdom doesn't implement the <img> optimization pipeline.
// Render a plain <img> with the src and alt attributes so tests can assert
// on them without needing the Next.js image optimizer.
vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => {
    // next/image passes fill, width, height, sizes, quality, priority, etc.
    // We only need src and alt for test assertions.  Pass through any other
    // standard img attributes that don't break the DOM.
    const {
      children: _children,
      fill: _fill,
      width: _width,
      height: _height,
      sizes: _sizes,
      quality: _quality,
      priority: _priority,
      loader: _loader,
      blurDataURL: _blurDataURL,
      placeholder: _placeholder,
      ...rest
    } = props;
    void _children; void _fill; void _width; void _height; void _sizes;
    void _quality; void _priority; void _loader; void _blurDataURL; void _placeholder;
    return createElement("img", rest);
  },
}));

// Mock next/link — renders an <a> tag so tests can assert on href attributes.
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...rest
  }: {
    children?: React.ReactNode;
    href: string;
    [key: string]: unknown;
  }) => createElement("a", { href, ...rest }, children),
}));

// Mock next/navigation — useSearchParams / useRouter / usePathname are not
// available in the jsdom environment without a router context.
vi.mock("next/navigation", () => ({
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
}));

// Mock the sonner toast library so toast.success / toast.error calls are
// no-ops during tests rather than trying to render toast DOM.
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Clean up after every test to prevent state leakage between tests.
afterEach(() => {
  vi.clearAllMocks();
});
