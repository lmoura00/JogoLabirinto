import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  Button,
  Dimensions,
  Alert,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import Maze from "../components/Maze";
import AntDesign from "@expo/vector-icons/AntDesign";
// Função para gerar labirintos (Algoritmo de Prim)
const generateMaze = (width, height) => {
  const maze = Array(height)
    .fill()
    .map(() => Array(width).fill(1));

  // Garantir que a posição (1, 1) seja sempre 0 (caminho livre)
  maze[1][1] = 0;

  const walls = [];
  if (1 > 0) walls.push({ x: 1 - 1, y: 1 });
  if (1 < width - 1) walls.push({ x: 1 + 1, y: 1 });
  if (1 > 0) walls.push({ x: 1, y: 1 - 1 });
  if (1 < height - 1) walls.push({ x: 1, y: 1 + 1 });

  while (walls.length > 0) {
    const randomIndex = Math.floor(Math.random() * walls.length);
    const { x, y } = walls[randomIndex];
    walls.splice(randomIndex, 1);

    let visitedNeighbors = 0;
    if (x > 0 && maze[y][x - 1] === 0) visitedNeighbors++;
    if (x < width - 1 && maze[y][x + 1] === 0) visitedNeighbors++;
    if (y > 0 && maze[y - 1][x] === 0) visitedNeighbors++;
    if (y < height - 1 && maze[y + 1][x] === 0) visitedNeighbors++;

    if (visitedNeighbors === 1) {
      maze[y][x] = 0;

      if (x > 0 && maze[y][x - 1] === 1) walls.push({ x: x - 1, y });
      if (x < width - 1 && maze[y][x + 1] === 1) walls.push({ x: x + 1, y });
      if (y > 0 && maze[y - 1][x] === 1) walls.push({ x, y: y - 1 });
      if (y < height - 1 && maze[y + 1][x] === 1) walls.push({ x, y: y + 1 });
    }
  }

  // Adicionar paredes ao redor do labirinto
  for (let i = 0; i < width; i++) {
    maze[0][i] = 1; // Primeira linha
    maze[height - 1][i] = 1; // Última linha
  }
  for (let i = 0; i < height; i++) {
    maze[i][0] = 1; // Primeira coluna
    maze[i][width - 1] = 1; // Última coluna
  }

  return maze;
};

// Função para verificar se há um caminho válido (DFS)
const hasPath = (maze, startX, startY, goalX, goalY) => {
  const visited = new Set();
  const stack = [{ x: startX, y: startY }];

  while (stack.length > 0) {
    const { x, y } = stack.pop();
    const key = `${x},${y}`;

    if (x === goalX && y === goalY) {
      return true;
    }

    if (visited.has(key)) {
      continue;
    }

    visited.add(key);

    if (x > 0 && maze[y][x - 1] !== 1) stack.push({ x: x - 1, y });
    if (x < maze[0].length - 1 && maze[y][x + 1] !== 1)
      stack.push({ x: x + 1, y });
    if (y > 0 && maze[y - 1][x] !== 1) stack.push({ x, y: y - 1 });
    if (y < maze.length - 1 && maze[y + 1][x] !== 1)
      stack.push({ x, y: y + 1 });
  }

  return false;
};

const GameScreen = ({ route, navigation }) => {
  const { level } = route.params;
  const [playerPosition, setPlayerPosition] = useState({ x: 1, y: 1 });
  const [maze, setMaze] = useState([]);
  const [showCompletionAnimation, setShowCompletionAnimation] = useState(false);
  const [startTime, setStartTime] = useState(null); // Tempo inicial
  const [elapsedTime, setElapsedTime] = useState(0); // Tempo decorrido
  const [score, setScore] = useState(0); // Pontuação

  // Obtém o tamanho da tela
  const { width, height } = Dimensions.get("window");
  const maxMazeSize = Math.min(width, height) - 60;

  useEffect(() => {
    let size = 5 + 2 * level;
    if (level > 5) {
      size = 5 + 2 * 5;
    }

    let newMaze;
    let hasValidPath = false;

    while (!hasValidPath) {
      newMaze = generateMaze(size, size);

      const goalX = size - 2;
      const goalY = size - 2;
      newMaze[goalY][goalX] = 2;

      hasValidPath = hasPath(newMaze, 1, 1, goalX, goalY);
    }

    setMaze(newMaze);
    setPlayerPosition({ x: 1, y: 1 });
    setStartTime(Date.now()); // Registra o tempo inicial
  }, [level]);

  const saveScore = async (level, score) => {
    try {
      const savedScores = await AsyncStorage.getItem("scores");
      const scores = savedScores ? JSON.parse(savedScores) : {};
      scores[level] = score;
      await AsyncStorage.setItem("scores", JSON.stringify(scores));
    } catch (error) {
      console.error("Erro ao salvar pontuação:", error);
    }
  };

  const movePlayer = async (direction) => {
    const { x, y } = playerPosition;
    let newX = x;
    let newY = y;

    if (direction === "up" && y > 0 && maze[y - 1][x] !== 1) newY = y - 1;
    if (direction === "down" && y < maze.length - 1 && maze[y + 1][x] !== 1)
      newY = y + 1;
    if (direction === "left" && x > 0 && maze[y][x - 1] !== 1) newX = x - 1;
    if (direction === "right" && x < maze[0].length - 1 && maze[y][x + 1] !== 1)
      newX = x + 1;

    setPlayerPosition({ x: newX, y: newY });

    if (maze[newY][newX] === 2) {
      const endTime = Date.now(); // Tempo final
      const timeElapsed = (endTime - startTime) / 1000; // Tempo em segundos
      setElapsedTime(timeElapsed);

      // Calcula a pontuação (exemplo: 1000 pontos por segundo restante)
      const baseScore = 1000;
      const levelScore = Math.max(0, baseScore - Math.floor(timeElapsed) * 10); // Ajuste a fórmula conforme necessário
      setScore(levelScore);
      saveScore(level, levelScore);
      setShowCompletionAnimation(true);
      setTimeout(() => {
        setShowCompletionAnimation(false);
        AsyncStorage.setItem("currentLevel", JSON.stringify(level + 1));
        navigation.navigate("Game", { level: level + 1 });
      }, 1000);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={"light-content"}
        backgroundColor={"#e4f1f7"}
        networkActivityIndicatorVisible
        showHideTransition={"fade"}
      />
      <Text style={styles.levelText}>Nível: {level}</Text>
      <View style={styles.mazeView}>
        <Maze
          maze={maze}
          playerPosition={playerPosition}
          cellSize={maxMazeSize / maze.length}
        />
      </View>

      {/* Animação de conclusão */}
      {showCompletionAnimation && (
        <Animated.View
          style={styles.completionAnimation}
          entering={FadeIn.duration(500)}
          exiting={FadeOut.duration(500)}
        >
          <Text style={styles.completionText}>Nível Concluído!</Text>
          <Text style={styles.completionText}>
            Tempo: {elapsedTime.toFixed(2)}s
          </Text>
          <Text style={styles.completionText}>Pontuação: {score}</Text>
        </Animated.View>
      )}

      {/* Botões de controle */}
      <View style={styles.controls}>
        <TouchableOpacity onPress={() => movePlayer("up")}>
          <AntDesign name="upcircle" size={44} color="black" />
        </TouchableOpacity>
        <View style={styles.horizontalControls}>
          <TouchableOpacity onPress={() => movePlayer("left")}>
            <AntDesign name="leftcircle" size={44} color="black" />
          </TouchableOpacity>

          <TouchableOpacity onPress={() => movePlayer("right")}>
            <AntDesign name="rightcircle" size={44} color="black" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={() => movePlayer("down")}>
          <AntDesign name="downcircle" size={44} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#e4f1f7",
  },
  levelText: {
    fontSize: 25,
    fontWeight: "600",
    marginBottom: 20,
    position: "absolute",
    top: 5,
    paddingTop: 10,
  },
  mazeView: {
    alignItems: "center",
    justifyContent: "center",
  },
  controls: {
    marginTop: 30,
    alignItems: "center",
  },
  horizontalControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: 140,
  },
  completionAnimation: {
    position: 'absolute',
    top: '40%',
    left: '50%',
    transform: [{ translateX: -80 }, { translateY: -50 }],
    backgroundColor: '#77bad5',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 20,
    color: '#000',
    marginBottom: 10,
  },
});

export default GameScreen;
