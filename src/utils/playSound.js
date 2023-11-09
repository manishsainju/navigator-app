import Sound from 'react-native-sound';
import { beepSound } from '../../assets';

export const playSound = new Sound(beepSound, error => {});
