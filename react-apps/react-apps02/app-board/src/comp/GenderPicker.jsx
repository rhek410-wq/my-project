import { GENDERS } from '../utils/format'

// 성별 선택 ("남자" | "여자"만 허용)
export default function GenderPicker({ value, onChange }) {
  return (
    <fieldset className="space-y-1.5">
      <legend className="label mb-1.5">성별</legend>
      <div className="grid grid-cols-2 gap-2">
        {GENDERS.map((g) => (
          <label
            key={g}
            className={`flex cursor-pointer items-center justify-center rounded-md border py-2 text-sm transition-colors ${
              value === g ? 'border-ink bg-subtle font-medium' : 'border-line text-muted hover:bg-subtle'
            }`}
          >
            <input type="radio" name="gender" value={g} checked={value === g} onChange={onChange} className="sr-only" />
            {g}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
