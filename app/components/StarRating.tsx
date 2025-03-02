import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StarRatingProps {
  rating: number;
  totalReviews?: number;
}

export default function StarRating({ rating, totalReviews }: StarRatingProps) {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <View style={styles.container}>
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((index) => (
          <Text
            key={index}
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
        ))}
      </View>
      {totalReviews !== undefined && (
        <Text style={styles.reviewCount}>({totalReviews}件)</Text>
      )}
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
  reviewCount: {
    marginLeft: 4,
    fontSize: 14,
    color: '#666',
  },
});