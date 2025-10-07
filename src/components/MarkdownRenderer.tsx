import React from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
}) => {
  // Parse markdown-like content and convert to JSX
  const parseContent = (text: string): React.ReactNode[] => {
    const lines = text.split("\n");
    const elements: React.ReactNode[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Skip empty lines
      if (!line.trim()) {
        elements.push(<br key={i} />);
        continue;
      }

      // Headers (### **Header**)
      if (line.match(/^#+\s*\*\*(.+?)\*\*/)) {
        const match = line.match(/^(#+)\s*\*\*(.+?)\*\*/);
        if (match) {
          const level = match[1].length;
          const text = match[2];
          const HeadingTag = `h${Math.min(
            level,
            6
          )}` as keyof JSX.IntrinsicElements;
          elements.push(
            React.createElement(
              HeadingTag,
              {
                key: i,
                className:
                  "font-bold text-gray-900 mt-4 mb-2 flex items-center",
              },
              <>
                <span className="mr-2">{getEmojiForHeader(text)}</span>
                {text}
              </>
            )
          );
        }
        continue;
      }

      // Emoji headers (📊 **Header**)
      if (line.match(/^[^\w\s]+\s*\*\*(.+?)\*\*/)) {
        const match = line.match(/^([^\w\s]+)\s*\*\*(.+?)\*\*:?\s*(.*)/);
        if (match) {
          const emoji = match[1];
          const title = match[2];
          const content = match[3];
          elements.push(
            <div key={i} className="mb-4">
              <h4 className="font-bold text-gray-900 mb-2 flex items-center">
                <span className="mr-2 text-lg">{emoji}</span>
                {title}
              </h4>
              {content && (
                <p className="text-gray-700 ml-6">
                  {parseInlineFormatting(content)}
                </p>
              )}
            </div>
          );
        }
        continue;
      }

      // List items (- item or • item)
      if (line.match(/^\s*[-•]\s+(.+)/)) {
        const match = line.match(/^\s*[-•]\s+(.+)/);
        if (match) {
          elements.push(
            <div key={i} className="flex items-start mb-2 ml-4">
              <span className="text-blue-600 mr-2 mt-1">•</span>
              <span className="text-gray-700">
                {parseInlineFormatting(match[1])}
              </span>
            </div>
          );
        }
        continue;
      }

      // Numbered lists
      if (line.match(/^\s*\d+\.\s+(.+)/)) {
        const match = line.match(/^\s*(\d+)\.\s+(.+)/);
        if (match) {
          elements.push(
            <div key={i} className="flex items-start mb-2 ml-4">
              <span className="text-blue-600 mr-2 font-medium">
                {match[1]}.
              </span>
              <span className="text-gray-700">
                {parseInlineFormatting(match[2])}
              </span>
            </div>
          );
        }
        continue;
      }

      // Bold text (**text**)
      if (line.includes("**")) {
        elements.push(
          <p key={i} className="text-gray-700 mb-2">
            {parseInlineFormatting(line)}
          </p>
        );
        continue;
      }

      // Regular paragraphs
      elements.push(
        <p key={i} className="text-gray-700 mb-2">
          {parseInlineFormatting(line)}
        </p>
      );
    }

    return elements;
  };

  // Parse inline formatting like **bold** and *italic*
  const parseInlineFormatting = (text: string): React.ReactNode => {
    const parts: React.ReactNode[] = [];
    let currentIndex = 0;

    // Handle **bold** text
    const boldRegex = /\*\*(.+?)\*\*/g;
    let match;

    while ((match = boldRegex.exec(text)) !== null) {
      // Add text before the match
      if (match.index > currentIndex) {
        parts.push(text.substring(currentIndex, match.index));
      }

      // Add bold text
      parts.push(
        <strong key={match.index} className="font-semibold text-gray-900">
          {match[1]}
        </strong>
      );

      currentIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (currentIndex < text.length) {
      parts.push(text.substring(currentIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  // Get appropriate emoji for header content
  const getEmojiForHeader = (text: string): string => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes("impact") || lowerText.includes("summary"))
      return "📊";
    if (lowerText.includes("risk") || lowerText.includes("assessment"))
      return "⚠️";
    if (lowerText.includes("immediate") || lowerText.includes("action"))
      return "🎯";
    if (lowerText.includes("short") || lowerText.includes("strategy"))
      return "📋";
    if (lowerText.includes("long") || lowerText.includes("adjustment"))
      return "🔄";
    if (lowerText.includes("optimization") || lowerText.includes("performance"))
      return "📈";
    if (
      lowerText.includes("prevention") ||
      lowerText.includes("recommendation")
    )
      return "💡";
    if (lowerText.includes("timeline") || lowerText.includes("schedule"))
      return "⏰";
    if (lowerText.includes("cost") || lowerText.includes("budget")) return "💰";
    if (lowerText.includes("staff") || lowerText.includes("personnel"))
      return "👥";
    if (lowerText.includes("patient") || lowerText.includes("care"))
      return "🏥";
    return "📌";
  };

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {parseContent(content)}
    </div>
  );
};

export default MarkdownRenderer;
