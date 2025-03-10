import React from 'react';
import { PanResponder, View } from 'react-native';

const Player = ({ onMove }) => {
  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      if (Math.abs(dx) > Math.abs(dy)) {
        onMove(dx > 0 ? 'right' : 'left');
      } else {
        onMove(dy > 0 ? 'down' : 'up');
      }
    },
    onPanResponderRelease: () => {
      // Resetar ou finalizar o gesto, se necessário
    },
  });

  return <View style={{ flex: 1 }} {...panResponder.panHandlers} />;
};

export default Player;