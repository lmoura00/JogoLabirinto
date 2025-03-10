import React from 'react';
import { View, StyleSheet } from 'react-native';

const Maze = ({ maze, playerPosition }) => {
  return (
    <View style={styles.container}>
      {maze.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((cell, cellIndex) => (
            <View
              key={cellIndex}
              style={[
                styles.cell,
                cell === 1 && styles.wall,
                cell === 2 && styles.goldenPoint, 
                rowIndex === playerPosition.y && cellIndex === playerPosition.x && styles.player,
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    width: 30,
    height: 30,
    borderWidth: 1,
    borderColor: '#000',
  },
  wall: {
    backgroundColor: '#000',
  },
  player: {
    backgroundColor: 'red',
  },
  goldenPoint: {
    backgroundColor: 'gold', // Cor do ponto dourado
  },
});

export default Maze;