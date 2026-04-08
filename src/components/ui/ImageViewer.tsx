import { useRef, useState, useEffect } from 'react';
import {
  View,
  Modal,
  FlatList,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
  Pressable,
  Text,
  StatusBar,
} from 'react-native';
import { Image } from 'expo-image';
import {
  GestureDetector,
  Gesture,
  NativeViewGestureHandler,
} from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { X } from 'lucide-react-native';
import { useUIStore } from '../../store';

const { width: W, height: H } = Dimensions.get('window');

// ── Single zoomable image ─────────────────────────────────────────────────────
function ZoomableImage({
  uri,
  onClose,
  scrollHandlerRef,
}: {
  uri: string;
  onClose: () => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  scrollHandlerRef: React.RefObject<any>;
}) {
  const [loading, setLoading] = useState(true);

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedX = useSharedValue(0);
  const savedY = useSharedValue(0);

  const resetZoom = () => {
    'worklet';
    scale.value = withSpring(1);
    savedScale.value = 1;
    translateX.value = withSpring(0);
    translateY.value = withSpring(0);
    savedX.value = 0;
    savedY.value = 0;
  };

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(1, Math.min(savedScale.value * e.scale, 5));
    })
    .onEnd(() => {
      if (scale.value < 1.1) {
        resetZoom();
      } else {
        savedScale.value = scale.value;
      }
    });

  // Pan only activates for translation when zoomed in.
  // When not zoomed, we let the FlatList handle horizontal swipes by
  // running simultaneously with the native scroll gesture handler.
  const pan = Gesture.Pan()
    .averageTouches(true)
    .simultaneousWithExternalGesture(scrollHandlerRef)
    .onUpdate((e) => {
      if (scale.value > 1) {
        // Panning while zoomed — translate the image
        translateX.value = savedX.value + e.translationX;
        translateY.value = savedY.value + e.translationY;
      } else if (
        // Swipe-down-to-close when NOT zoomed (vertical bias)
        Math.abs(e.translationY) > 80 &&
        Math.abs(e.translationY) > Math.abs(e.translationX) * 1.5
      ) {
        runOnJS(onClose)();
      }
    })
    .onEnd(() => {
      savedX.value = translateX.value;
      savedY.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .maxDelay(200)
    .onEnd(() => {
      if (scale.value > 1) {
        resetZoom();
      } else {
        scale.value = withSpring(2.5);
        savedScale.value = 2.5;
      }
    });

  const composed = Gesture.Simultaneous(pinch, Gesture.Race(doubleTap, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <View style={styles.imageSlide}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
          <Image
            source={{ uri }}
            style={{ width: W, height: H }}
            contentFit="contain"
            cachePolicy="memory-disk"
            transition={200}
            onLoadStart={() => setLoading(true)}
            onLoadEnd={() => setLoading(false)}
          />
        </Animated.View>
      </GestureDetector>
      {loading && (
        <ActivityIndicator
          style={StyleSheet.absoluteFill}
          color="rgba(255,255,255,0.8)"
          size="large"
        />
      )}
    </View>
  );
}

// ── Global ImageViewer modal ──────────────────────────────────────────────────
export function ImageViewer() {
  const open = useUIStore((s) => s.imageViewerOpen);
  const images = useUIStore((s) => s.imageViewerImages);
  const initialIndex = useUIStore((s) => s.imageViewerIndex);
  const close = useUIStore((s) => s.closeImageViewer);

  const [displayIndex, setDisplayIndex] = useState(0);
  // ref for NativeViewGestureHandler wrapping the FlatList
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const nativeRef = useRef<any>(null);
  const flatListRef = useRef<FlatList>(null);

  // Sync display index whenever the viewer opens with a new initial index
  useEffect(() => {
    if (open) setDisplayIndex(initialIndex);
  }, [open, initialIndex]);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <StatusBar hidden />
      <View style={styles.container}>
        {/* NativeViewGestureHandler lets the FlatList's native scroll
            gesture coexist with the inner GestureDetectors */}
        <NativeViewGestureHandler ref={nativeRef} disallowInterruption={false}>
          <FlatList
            ref={flatListRef}
            data={images}
            keyExtractor={(_, i) => String(i)}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(_, index) => ({
              length: W,
              offset: W * index,
              index,
            })}
            onMomentumScrollEnd={(e) => {
              const idx = Math.round(e.nativeEvent.contentOffset.x / W);
              setDisplayIndex(idx);
            }}
            renderItem={({ item }) => (
              <ZoomableImage
                uri={item}
                onClose={close}
                scrollHandlerRef={nativeRef}
              />
            )}
          />
        </NativeViewGestureHandler>

        {/* Header overlay */}
        <View style={styles.header} pointerEvents="box-none">
          <Pressable onPress={close} style={styles.closeBtn} hitSlop={12}>
            <X size={22} color="#fff" />
          </Pressable>
          {images.length > 1 && (
            <Text style={styles.counter}>
              {displayIndex + 1} / {images.length}
            </Text>
          )}
          <View style={{ width: 44 }} />
        </View>

        {/* Dot indicators */}
        {images.length > 1 && (
          <View style={styles.dots} pointerEvents="none">
            {images.map((_, i) => (
              <View
                key={i}
                style={[styles.dot, i === displayIndex && styles.dotActive]}
              />
            ))}
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  imageSlide: {
    width: W,
    height: H,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 52,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    zIndex: 10,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  dots: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  dotActive: {
    backgroundColor: '#fff',
    width: 18,
    borderRadius: 3,
  },
});
