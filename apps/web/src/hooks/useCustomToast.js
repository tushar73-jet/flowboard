"use client";
import { useToast } from "@chakra-ui/react";
import { useCallback } from "react";
import { CheckCircle2, XCircle, Info, AlertTriangle, RotateCcw } from "lucide-react";

const BASE_STYLE = {
  position: "bottom-right",
  duration: 4000,
  isClosable: true,
};

const ICON_MAP = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warning: AlertTriangle,
};

export function useCustomToast() {
  const toast = useToast();

  const show = useCallback(
    ({ title, description, status = "info", duration = 4000, onUndo, undoLabel = "Undo" } = {}) => {
      const Icon = ICON_MAP[status] || Info;
      const colorMap = {
        success: { accent: "#10b981", bg: "rgba(16,185,129,0.12)", border: "rgba(16,185,129,0.25)" },
        error:   { accent: "#ef4444", bg: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.25)"  },
        warning: { accent: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.25)" },
        info:    { accent: "#6366f1", bg: "rgba(99,102,241,0.12)", border: "rgba(99,102,241,0.25)" },
      };
      const colors = colorMap[status] || colorMap.info;

      return toast({
        ...BASE_STYLE,
        duration: onUndo ? 6000 : duration,
        render: ({ onClose }) => (
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "12px",
              padding: "14px 16px",
              background: "#0f172a",
              border: `1px solid ${colors.border}`,
              borderLeft: `3px solid ${colors.accent}`,
              borderRadius: "12px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              minWidth: "280px",
              maxWidth: "380px",
              color: "white",
              fontSize: "14px",
              backdropFilter: "blur(12px)",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: colors.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                marginTop: "1px",
              }}
            >
              <Icon size={16} color={colors.accent} />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <div style={{ fontWeight: 700, color: "rgba(255,255,255,0.95)", marginBottom: description ? "2px" : 0 }}>
                  {title}
                </div>
              )}
              {description && (
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: "12px", lineHeight: "1.5" }}>
                  {description}
                </div>
              )}
              {onUndo && (
                <button
                  onClick={() => { onUndo(); onClose(); }}
                  style={{
                    marginTop: "8px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: colors.accent,
                    background: "none",
                    border: "none",
                    padding: 0,
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={11} />
                  {undoLabel}
                </button>
              )}
            </div>

            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                color: "rgba(255,255,255,0.3)",
                cursor: "pointer",
                fontSize: "18px",
                lineHeight: 1,
                padding: "0 0 0 4px",
                flexShrink: 0,
              }}
            >
              ×
            </button>
          </div>
        ),
      });
    },
    [toast]
  );

  return {
    success: (opts) => show({ ...opts, status: "success" }),
    error:   (opts) => show({ ...opts, status: "error"   }),
    warning: (opts) => show({ ...opts, status: "warning" }),
    info:    (opts) => show({ ...opts, status: "info"    }),
    // Convenience: deletion toast with undo
    deleted: (title, onUndo) =>
      show({ title, status: "info", onUndo, undoLabel: "Undo deletion" }),
  };
}
