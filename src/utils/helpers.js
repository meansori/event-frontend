// File: src/utils/helpers.js
import { format, parseISO } from "date-fns";

export const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy");
  } catch (error) {
    return dateString;
  }
};

export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    return format(parseISO(dateString), "dd/MM/yyyy HH:mm");
  } catch (error) {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  if (!timeString) return "-";
  try {
    return timeString.substring(0, 5); // Format HH:mm
  } catch (error) {
    return timeString;
  }
};

export const getAttendanceColor = (status) => {
  switch (status) {
    case "present":
      return "success";
    case "late":
      return "warning";
    case "absent":
      return "danger";
    default:
      return "secondary";
  }
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};
