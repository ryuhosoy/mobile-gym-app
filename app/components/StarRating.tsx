import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
}

export default function StarRating({ rating, onRatingChange }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <TouchableOpacity
            key={index}
            onPress={() => onRatingChange && onRatingChange(index)}
          >
            <Text
              style={[
                styles.star,
                {
                  color:
                    index <= fullStars
                      ? '#FFB100'
                      : index === fullStars + 1 && hasHalfStar
                      ? '#FFB100'
                      : '#D1D1D1',
                },
              ]}
            >
              {index <= fullStars
                ? '★'
                : index === fullStars + 1 && hasHalfStar
                ? '★'
                : '☆'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 16,
    marginRight: 2,
  },
});