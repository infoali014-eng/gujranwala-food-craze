'use client';

import React from 'react';
import { Check } from 'lucide-react';

export type NoteColor = 'cream' | 'amber' | 'red';

interface NoteColorPickerProps {
  selectedColor: NoteColor;
  onChange: (color: NoteColor) => void;
}

export const NoteColorPicker: React.FC<NoteColorPickerProps> = ({
  selectedColor,
  onChange,
}) => {
  const options: { color: NoteColor; label: string; bgHex: string; borderHex: string; checkColor: string }[] = [
    {
      color: 'cream',
      label: 'Cream Note',
      bgHex: '#FFFDF4',
      borderHex: '#D8C39E',
      checkColor: '#2B0A0C',
    },
    {
      color: 'amber',
      label: 'Amber Note',
      bgHex: '#FFDF80',
      borderHex: '#D99532',
      checkColor: '#2B0A0C',
    },
    {
      color: 'red',
      label: 'Red Note',
      bgHex: '#C30D1A',
      borderHex: '#8F0A13',
      checkColor: '#FDEFDA',
    },
  ];

  return (
    <div className="flex items-center gap-4 pt-1">
      {options.map((opt) => {
        const isSelected = selectedColor === opt.color;
        return (
          <button
            key={opt.color}
            type="button"
            onClick={() => onChange(opt.color)}
            aria-label={opt.label}
            aria-pressed={isSelected}
            className={`group relative flex items-center justify-center rounded-full transition-transform active:scale-95 cursor-pointer min-w-[50px] min-h-[50px] w-13 h-13 shadow-sm ${
              isSelected
                ? 'ring-4 ring-offset-2 ring-craze-red scale-105 shadow-md'
                : 'hover:scale-105 opacity-90 hover:opacity-100'
            }`}
            style={{
              backgroundColor: opt.bgHex,
              border: `3px solid ${opt.borderHex}`,
            }}
          >
            {isSelected && (
              <Check
                className="w-5 h-5 stroke-[3]"
                style={{ color: opt.checkColor }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
