import type { ReactElement, SVGProps } from "react";

import type { EnrichedMatch } from "@/features/match-center/build-matches";

import type { BracketOverlayPosition } from "./bracket-layout";
import type { SingleEliminationMatch } from "./single-elimination-match";

import {
  SingleEliminationBracket,
  SVGViewer,
} from "@g-loot/react-tournament-brackets";
import {
  cloneElement,
  createElement,
  isValidElement,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getBracketColumnCount,
  getBracketOverlayHeight,
  getFinalMatchLabelPosition,
  getThirdPlacePosition,
} from "./bracket-layout";
import {
  FinalMatchLabel,
  ThirdPlaceMatchSection,
} from "./bracket-match-labels";
import { BracketMatchLookupProvider } from "./bracket-match-lookup";
import {
  BRACKET_CANVAS_BACKGROUND,
  BRACKET_VIEW_OPTIONS,
  bracketTheme,
} from "./bracket-theme";
import { BracketTournamentMatch } from "./bracket-tournament-match";

type BracketTournamentViewProps = {
  readonly enrichedMatches: EnrichedMatch[];
  readonly matches: SingleEliminationMatch[];
  readonly thirdPlaceMatch: EnrichedMatch | null;
};

const MIN_VIEWER_HEIGHT = 480;
const MIN_VIEWER_WIDTH = 640;

type BracketSvgElement = ReactElement<SVGProps<SVGSVGElement>>;

function createBracketOverlay({
  children,
  className,
  position,
}: {
  children: ReactElement;
  className?: string;
  position: BracketOverlayPosition;
}) {
  return (
    <foreignObject
      height={position.height}
      width={position.width}
      x={position.x}
      y={position.y}
    >
      {createElement(
        "div",
        {
          className: className ?? "text-foreground",
          xmlns: "http://www.w3.org/1999/xhtml",
        },
        children,
      )}
    </foreignObject>
  );
}

function injectBracketOverlaysIntoSvg({
  bracketHeight,
  bracketWidth,
  columnCount,
  svg,
  thirdPlaceMatch,
}: {
  bracketHeight: number;
  bracketWidth: number;
  columnCount: number;
  svg: BracketSvgElement;
  thirdPlaceMatch: EnrichedMatch | null;
}): BracketSvgElement {
  if (!isValidElement(svg)) {
    return svg;
  }

  const finalLabelPosition = getFinalMatchLabelPosition(columnCount);
  const thirdPlacePosition = thirdPlaceMatch
    ? getThirdPlacePosition(columnCount)
    : null;
  const extendedHeight = getBracketOverlayHeight({
    bracketHeight,
    columnCount,
    hasThirdPlaceMatch: thirdPlaceMatch !== null,
  });
  const svgChildren = svg.props.children;

  return cloneElement(svg, {
    children: (
      <>
        {svgChildren}
        {createBracketOverlay({
          children: <FinalMatchLabel />,
          position: finalLabelPosition,
        })}
        {thirdPlaceMatch && thirdPlacePosition
          ? createBracketOverlay({
              children: <ThirdPlaceMatchSection match={thirdPlaceMatch} />,
              position: thirdPlacePosition,
            })
          : null}
      </>
    ),
    height: extendedHeight,
    viewBox: `0 0 ${bracketWidth} ${extendedHeight}`,
  });
}

type BracketSvgWrapperProps = {
  readonly bracketHeight: number;
  readonly bracketWidth: number;
  readonly children: ReactElement;
  readonly matches: SingleEliminationMatch[];
  readonly startAt: number[];
  readonly thirdPlaceMatch: EnrichedMatch | null;
};

function createBracketSvgWrapper(
  matches: SingleEliminationMatch[],
  thirdPlaceMatch: EnrichedMatch | null,
): (
  props: Omit<BracketSvgWrapperProps, "matches" | "thirdPlaceMatch">,
) => ReactElement {
  return function BoundBracketSvgWrapper(props) {
    return (
      <BracketSvgWrapper
        {...props}
        matches={matches}
        thirdPlaceMatch={thirdPlaceMatch}
      />
    );
  };
}

function BracketSvgWrapper({
  bracketHeight,
  bracketWidth,
  children,
  matches,
  startAt,
  thirdPlaceMatch,
}: BracketSvgWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({
    height: MIN_VIEWER_HEIGHT,
    width: MIN_VIEWER_WIDTH,
  });

  useEffect(() => {
    const element = containerRef.current;

    if (!element) {
      return;
    }

    const updateSize = () => {
      const { height, width } = element.getBoundingClientRect();

      setSize({
        height: Math.max(height, MIN_VIEWER_HEIGHT),
        width: Math.max(width, MIN_VIEWER_WIDTH),
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  const columnCount = getBracketColumnCount(matches);
  const viewerBracketHeight = getBracketOverlayHeight({
    bracketHeight,
    columnCount,
    hasThirdPlaceMatch: thirdPlaceMatch !== null,
  });
  const svgChildren = isValidElement(children)
    ? injectBracketOverlaysIntoSvg({
        bracketHeight: viewerBracketHeight,
        bracketWidth,
        columnCount,
        svg: children as BracketSvgElement,
        thirdPlaceMatch,
      })
    : children;

  return (
    <div
      className="h-[min(70vh,900px)] min-h-[480px] w-full bg-background"
      ref={containerRef}
    >
      <SVGViewer
        SVGBackground={BRACKET_CANVAS_BACKGROUND}
        background={BRACKET_CANVAS_BACKGROUND}
        bracketHeight={viewerBracketHeight}
        bracketWidth={bracketWidth}
        height={size.height}
        startAt={startAt}
        width={size.width}
      >
        {svgChildren}
      </SVGViewer>
    </div>
  );
}

export function BracketTournamentView({
  enrichedMatches,
  matches,
  thirdPlaceMatch,
}: BracketTournamentViewProps) {
  const SvgWrapper = useMemo(
    () => createBracketSvgWrapper(matches, thirdPlaceMatch),
    [matches, thirdPlaceMatch],
  );

  return (
    <BracketMatchLookupProvider enrichedMatches={enrichedMatches}>
      <div className="overflow-x-auto overflow-y-visible pb-4">
        <SingleEliminationBracket
          matchComponent={BracketTournamentMatch}
          matches={matches}
          options={BRACKET_VIEW_OPTIONS}
          svgWrapper={SvgWrapper}
          theme={bracketTheme}
        />
      </div>
    </BracketMatchLookupProvider>
  );
}
