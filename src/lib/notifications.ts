import { Notyf } from 'notyf';
import 'notyf/notyf.min.css';

export const notif = new Notyf({
  duration: 1500,
  ripple: false,
  position: {
    x: 'left',
    y: 'bottom',
  }
});
