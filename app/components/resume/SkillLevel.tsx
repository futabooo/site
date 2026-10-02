const MAX_LEVEL = 5

export const SkillLevel = ({ level }: { level: number }) => (
  <span class='flex gap-1' role='img' aria-label={`${MAX_LEVEL}段階中${level}`}>
    {[...Array(MAX_LEVEL)].map((_, i) => (
      <span
        class={`block w-2.5 h-2.5 rounded-full ${
          i < level ? 'bg-primary' : 'bg-base-300'
        }`}
      />
    ))}
  </span>
)
