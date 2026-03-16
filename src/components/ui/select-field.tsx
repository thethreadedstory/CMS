"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const EMPTY_OPTION_VALUE = "__empty__"

interface SelectFieldOption {
  value: string
  label: React.ReactNode
  disabled?: boolean
}

interface SelectFieldProps {
  id?: string
  name?: string
  value: string
  onValueChange: (value: string) => void
  options: SelectFieldOption[]
  placeholder: string
  emptyLabel?: React.ReactNode
  disabled?: boolean
  required?: boolean
  className?: string
  contentClassName?: string
  dataTestId?: string
}

export function SelectField({
  id,
  name,
  value,
  onValueChange,
  options,
  placeholder,
  emptyLabel,
  disabled = false,
  required = false,
  className,
  contentClassName,
  dataTestId,
}: SelectFieldProps) {
  const normalizedValue =
    value === ""
      ? emptyLabel !== undefined
        ? EMPTY_OPTION_VALUE
        : undefined
      : value

  return (
    <>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <Select
        value={normalizedValue}
        onValueChange={(nextValue) =>
          onValueChange(nextValue === EMPTY_OPTION_VALUE ? "" : nextValue)
        }
        disabled={disabled}
      >
        <SelectTrigger
          id={id}
          aria-required={required}
          className={cn("w-full", className)}
          data-testid={dataTestId}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className={contentClassName}>
          {emptyLabel !== undefined ? (
            <SelectItem value={EMPTY_OPTION_VALUE}>{emptyLabel}</SelectItem>
          ) : null}
          {options.map((option) => (
            <SelectItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </>
  )
}
