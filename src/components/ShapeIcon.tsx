interface ShapeIconProps {
  size?: number;
  w: string;
  h: string;
  radius: string;
  rotate?: string;
  color: string;
  fill?: string;
  strokeWidth?: number;
}

// Минималистичная геометрическая иконка (квадрат/ромб со скруглением) —
// так обозначены категории и вкладки в исходном дизайн-прототипе.
export function ShapeIcon({ size = 21, w, h, radius, rotate = "0deg", color, fill = "transparent", strokeWidth = 2 }: ShapeIconProps) {
  return (
    <span style={{ width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span
        style={{
          width: w,
          height: h,
          border: `${strokeWidth}px solid ${color}`,
          borderRadius: radius,
          background: fill,
          transform: `rotate(${rotate})`,
          display: "block",
        }}
      />
    </span>
  );
}
