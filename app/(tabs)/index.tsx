import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Animated, View, Dimensions, Alert, Text } from 'react-native';
import { Accelerometer } from 'expo-sensors';

export default function App() {
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;
  const [subscription, setSubscription] = useState(null);
  const [position, setPosition] = useState({ x: screenWidth * .5 - 25, y: 0 });
  const [isPaused, setIsPaused] = useState(false);



  // Animation ref for rotating box
  const rotAnim = useRef(new Animated.Value(0)).current;
  const growAnim = useRef(new Animated.Value(0)).current;

  // Subscribe to accelerometer
  const _subscribe = () => {
    Accelerometer.setUpdateInterval(20);
    const newSubscription = Accelerometer.addListener(({ x, y }) => {
      if (isPaused) return;
      setPosition(prevPosition => ({
        x: Math.min(Math.max(prevPosition.x + (20 * x), 0), screenWidth - 50),
        y: Math.min(Math.max(prevPosition.y - (20 * y), 0), screenHeight - 50),
      }));
    });
    setSubscription(newSubscription);
  };

  // Unsubscribe from accelerometer
  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  // Effect to handle subscription on mount and unmount
  useEffect(() => {
    sendStart('Tilt your phone to get the blue box to the green goal without touching a red box. GOOD LUCK!', 'PLAY!');
    return () => {
      _unsubscribe();
    };
  }, []);

  // Effect to handle the rotating animation
  useEffect(() => {
    const rotationAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(rotAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(rotAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ])
    );
    const growAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(growAnim, {
          toValue: 1,
          duration: 450,
          useNativeDriver: true,
        }),
        Animated.timing(growAnim, {
          toValue: 0,
          duration: 450,
          useNativeDriver: true,
        }),
      ])
    );

    if (!isPaused) {
      rotationAnimation.start();
      growAnimation.start();
    }

  }, [isPaused, rotAnim, growAnim]);


  const detectCollision = () => {
    const box1Width = 50;
    const box1Height = 50;

    const box1Left = position.x;
    const box1Right = position.x + box1Width;
    const box1Top = position.y;
    const box1Bottom = position.y + box1Height;

    function checkCollision(enemyBox) {

      return (
        box1Right >= enemyBox.left + 3 &&
        box1Left <= enemyBox.right - 3 &&
        box1Bottom >= enemyBox.top + 3 &&
        box1Top <= enemyBox.bottom - 3
      );
    }

    let collisionDetected = false;

    for(let i = 0; i < boxes.length; i++){
      if(checkCollision(boxes[i])){
        collisionDetected = true;
      }
    }

    if (collisionDetected) {
      sendAlert('YOU LOSE!', 'Try Again');
    }
    if (position.y >= screenHeight - 100) {
      sendAlert('YOU WIN!', 'Play again!');
    }
  };

  // Function to handle alert messages and pause state
  const sendAlert = (message, answer) => {
    setIsPaused(true);
    _unsubscribe();
    Alert.alert(message, '', [
      {
        text: answer,
        onPress: () => {
          setIsPaused(false);
          sendStart('Tilt your phone to get the blue box to the green goal without touching a red box. GOOD LUCK!', 'PLAY!');
          setPosition({ x: 175, y: 0 });
        },
      },
    ]);
  };

  const sendStart = (message, answer) => {
    setIsPaused(true);
    _unsubscribe();
    Alert.alert(message, '', [
      {
        text: answer,
        onPress: () => {
          setIsPaused(false);
          _subscribe();
          setPosition({ x: 175, y: 0 });
        },
      },
    ]);
  };

  // Effect to trigger collision detection on position change
  useEffect(() => {
    if (!isPaused) {
      detectCollision();
    }
  }, [position]);

    // Boxes definition for collision detection
    const boxes = [
      { width: 50, height: 50, left: screenWidth * .14, right: screenWidth * .14 + 50, top: screenHeight * .17, bottom: screenHeight * .17 + 50 },
      { width: 40, height: 40, left: screenWidth * .45, right: screenWidth * .45 + 40, top: screenHeight * .22, bottom: screenHeight * .22 + 50 }, 
      { width: 60, height: 60, left: screenWidth * .82, right: screenWidth * .82 + 60, top: screenHeight * .11, bottom: screenHeight * .11 + 60 },
      { width: 70, height: 70, left: screenWidth * .77, right: screenWidth * .77 + 70, top: screenHeight * .31, bottom: screenHeight * .31 + 67 },
      { width: 30, height: 30, left: screenWidth * .27, right: screenWidth * .27 + 30, top: screenHeight * .36, bottom: screenHeight * .36 + 30 },
      { width: 80, height: 80, left: screenWidth * .47, right: screenWidth * .47 + 80, top: screenHeight * .52, bottom: screenHeight * .52 + 80 },
      { width: 42, height: 42, left: screenWidth * .11, right: screenWidth * .11 + 42, top: screenHeight * .47, bottom: screenHeight * .47 + 42 },
      { width: 52, height: 52, left: screenWidth * .11, right: screenWidth * .11 + 52, top: screenHeight * .67, bottom: screenHeight * .67 + 45 },
      { width: 52, height: 52, left: screenWidth * .43, right: screenWidth * .43 + 52, top: screenHeight * .75, bottom: screenHeight * .75 + 52 },
      { width: 42, height: 42, left: screenWidth * .79, right: screenWidth * .79 + 42, top: screenHeight * .75, bottom: screenHeight * .75 + 42 }
    ];

  // Render component
  return (
    
    <View style={styles.container}>
      <View
          style={{
            zIndex: -1,
            width: screenWidth,
            height: 50,
            position: 'absolute',
            backgroundColor: 'mediumorchid',
            top: 0
          }}
        />
      <Text           
        style={{
          zIndex: 1,
          width: screenWidth,
          fontSize: '40px',
          textAlign: 'center',
          textAlignVertical: "center",
          position: 'absolute',
          color: 'white',
          top: 0
        }}>----START----</Text>
      <Animated.View
        style={{
          width: 50,
          height: 50,
          backgroundColor: "blue",
          position: 'absolute',
          left: position.x,
          top: position.y,
          transform: [{ scaleY: growAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.15],
          }) }, { scaleX: growAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1.15, 1],
          }) }],
        }}
      />
      

      {boxes.map((box, index) => (
        <Animated.View
          key={index}
          style={{
            width: box.width,
            height: box.height,
            position: 'absolute',
            backgroundColor: 'red',
            left: box.left,
            top: box.top,
            transform: [{ rotateZ: rotAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['-2deg', '2deg'],
            }) }],
          }}
        />
      ))}
        <View
          style={{
            zIndex: -1,
            width: screenWidth,
            height: 100,
            position: 'absolute',
            backgroundColor: 'green',
            top: screenHeight - 100
          }}
        /><Text           
        style={{
          color: 'gold',
          zIndex: 1,
          width: screenWidth,
          fontSize: '40px',
          textAlign: 'center',
          textAlignVertical: "center",
          position: 'absolute',
          top: screenHeight - 100
        }}>----GOAL----</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});


