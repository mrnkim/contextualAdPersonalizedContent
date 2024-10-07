import clsx from "clsx";
import LoadingSpinner from "./LoadingSpinner";
import { forwardRef, memo, useMemo } from "react";
import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  appearance?: "primary" | "default" | "danger" | "secondary" | "subtle";
  rounded?: boolean;
  loading?: boolean;
  disableFocusStyle?: boolean;
}

const filledButtonClasses = clsx(
  // background
  [
    "disabled:bg-grey-200 disabled:dark:bg-grey-900", // disabled style
  ],
  // text
  [
    "disabled:text-grey-500 disabled:dark:text-grey-700", // disabled style
  ]
);
const textButtonClasses = clsx(
  // background & border
  [
    "bg-transparent border-transparent", // initial state
    "disabled:bg-transparent",
  ],
  // text
  [
    "disabled:text-grey-500", // disabled state
  ]
);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      // required props
      children,
      size = "md",
      appearance = "default",
      // optional props
      className,
      rounded,
      loading,
      disabled,
      disableFocusStyle,
      ...props
    },
    ref
  ) => {
    const appearanceClasses = useMemo(() => {
      switch (appearance) {
        /**
         * Filled type buttons
         */
        case "primary":
          return clsx(
            filledButtonClasses,
            // background & ring
            [
              "bg-primary", // initial style
              "hover:bg-green-700", // hover style
              "active:bg-green-800", // active style
            ],
            // text
            [
              "text-grey-1000", //  initial style
            ]
          );
        case "default":
          return clsx(
            filledButtonClasses,
            // background & ring
            [
              "bg-grey-200 dark:bg-grey-900", // initial style
              "hover:bg-grey-300 hover:dark:bg-grey-800", // hover style
              "active:bg-grey-400 active:dark:bg-grey-700", // active style
            ],
            // text
            [
              "text-grey-1000 dark:text-grey-300", //  initial style
            ]
          );
        case "danger":
          return clsx(
            filledButtonClasses,
            // background & ring
            [
              "bg-error", // initial style
              "hover:bg-red-700 hover:dark:ring-error", // hover style
              "active:bg-red-800 active:dark:bg-red-300", // active style
            ]
          );
        /**
         * Text type buttons
         */
        case "secondary": // TODO: Support dark mode
          return clsx(
            textButtonClasses,
            // background
            [
              "hover:bg-moss_green-100", // hover style
              "active:bg-moss_green-200", // active style
            ],
            // text
            [
              "text-secondary", // initial style
            ]
          );
        case "subtle": // TODO: Support dark mode
          return clsx(
            textButtonClasses,
            // background
            [
              "hover:bg-grey-100", // hover style
              "active:bg-grey-200", // active style
            ],
            // text
            [
              "text-grey-700", // initial style
            ]
          );
        default:
          throw new Error(`Invalid appearance prop: ${appearance}`);
      }
    }, [appearance]);

    const sizeClasses = useMemo(() => {
      switch (size) {
        case "xs":
          return clsx(
            "px-2",
            "h-7",
            "text-body3 font-medium",
            "[&>svg]:w-4 [&>svg]:h-4",
            rounded && "rounded-sm"
          );
        case "sm":
          return clsx(
            "px-3",
            "h-9",
            "text-subtitle3",
            "[&>svg]:w-5 [&>svg]:h-5",
            rounded && "rounded-sm"
          );
        case "md":
          return clsx(
            "px-3",
            "h-10",
            "text-subtitle3",
            "[&>svg]:w-5 [&>svg]:h-5",
            rounded && "rounded"
          );
        case "lg":
          return clsx(
            "px-3",
            "h-11",
            "text-subtitle2",
            "[&>svg]:w-6 [&>svg]:h-6",
            rounded && "rounded"
          );
        case "xl":
          return clsx(
            "px-4",
            "h-12",
            "text-subtitle2",
            "[&>svg]:w-6 [&>svg]:h-6",
            rounded && "rounded"
          );
        default:
          throw new Error(`Invalid size prop: ${size}`);
      }
    }, [size]);

    return (
      <button
        {...props}
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          ["flex items-center justify-center gap-x-1", "whitespace-nowrap"], // initial style
          !disableFocusStyle &&
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary", // focus style
          "disabled:cursor-not-allowed", // disabled style
          appearanceClasses,
          "min-w-[64px]",
          sizeClasses,
          className
        )}
      >
        {loading ? (
          <LoadingSpinner
            size={["xs", "sm", "md"].includes(size) ? "sm" : "md"}
          />
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export default memo(Button);
