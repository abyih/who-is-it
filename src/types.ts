export type Variant = "info" | "success" | "warning" | "danger";

export type AlertTypeOptions = {
  color: string;
  icon: any;
};

export type AlertType = {
  info: AlertTypeOptions;
  success: AlertTypeOptions;
  warning: AlertTypeOptions;
  danger: AlertTypeOptions;
};
