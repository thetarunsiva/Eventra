function ClosedEventOverlay() {
      return (
            <div
                  aria-hidden="true"
                  style={{
                        position: "absolute",
                        inset: 0,
                        pointerEvents: "none",
                        overflow: "hidden",
                        borderRadius: "inherit",
                        backgroundImage:
                              "repeating-linear-gradient(135deg, rgba(0, 0, 0, 0.08) 0 14px, rgba(255, 255, 255, 0.08) 14px 28px)",
                        opacity: 0.95,
                  }}
            >
                  <div
                        style={{
                              position: "absolute",
                              top: "50%",
                              left: "50%",
                              transform: "translate(-50%, -50%) rotate(-18deg)",
                              fontSize: "clamp(3rem, 10vw, 7rem)",
                              fontWeight: 900,
                              letterSpacing: "0.35em",
                              color: "rgba(15, 15, 15, 0.6)",
                              textShadow: "0 2px 0 rgba(255, 255, 255, 0.3)",
                              whiteSpace: "nowrap",
                              lineHeight: 1,
                        }}
                  >
                        CLOSED
                  </div>
            </div>
      );
}

export default ClosedEventOverlay;