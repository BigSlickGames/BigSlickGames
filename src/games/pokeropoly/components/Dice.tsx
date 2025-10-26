interface DiceProps {
  value: number;
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  isRolling: boolean;
}

export function Dice({ value, position, rotation, isRolling }: DiceProps) {
  const getDotPositions = (face: number) => {
    const positions: Array<{ x: number; y: number }> = [];

    switch (face) {
      case 1:
        positions.push({ x: 50, y: 50 });
        break;
      case 2:
        positions.push({ x: 30, y: 30 }, { x: 70, y: 70 });
        break;
      case 3:
        positions.push({ x: 30, y: 30 }, { x: 50, y: 50 }, { x: 70, y: 70 });
        break;
      case 4:
        positions.push({ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 70 }, { x: 70, y: 70 });
        break;
      case 5:
        positions.push({ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 50, y: 50 }, { x: 30, y: 70 }, { x: 70, y: 70 });
        break;
      case 6:
        positions.push({ x: 30, y: 30 }, { x: 70, y: 30 }, { x: 30, y: 50 }, { x: 70, y: 50 }, { x: 30, y: 70 }, { x: 70, y: 70 });
        break;
    }

    return positions;
  };

  const renderFace = (faceValue: number, transform: string) => (
    <div
      className="absolute w-full h-full bg-white border-2 border-gray-800 rounded-lg shadow-2xl"
      style={{
        transform,
        backfaceVisibility: 'hidden',
      }}
    >
      {getDotPositions(faceValue).map((pos, idx) => (
        <div
          key={idx}
          className="absolute w-3 h-3 bg-gray-900 rounded-full"
          style={{
            left: `${pos.x}%`,
            top: `${pos.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}
    </div>
  );

  return (
    <div
      className="absolute"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, ${position.z}px)`,
        transition: isRolling ? 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
      }}
    >
      <div
        className="relative w-16 h-16"
        style={{
          transformStyle: 'preserve-3d',
          transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.z}deg)`,
          transition: isRolling ? 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'none',
        }}
      >
        {renderFace(1, 'translateZ(32px)')}
        {renderFace(2, 'rotateY(90deg) translateZ(32px)')}
        {renderFace(3, 'rotateY(180deg) translateZ(32px)')}
        {renderFace(4, 'rotateY(-90deg) translateZ(32px)')}
        {renderFace(5, 'rotateX(90deg) translateZ(32px)')}
        {renderFace(6, 'rotateX(-90deg) translateZ(32px)')}
      </div>
    </div>
  );
}
