import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { RankBadge } from '../components/RankBadge';
import { ScreenHeader } from '../components/ScreenHeader';
import { SurfaceCard } from '../components/SurfaceCard';
import { useApp } from '../state/AppProvider';
import { theme } from '../theme/theme';
import { formatDateLabel } from '../utils/format';

export function FeedScreen() {
  const { posts, users, comments, likePost, addComment } = useApp();
  const [draftComments, setDraftComments] = useState<Record<string, string>>({});

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <ScreenHeader
        eyebrow="Feed"
        title="Friend activity"
        subtitle="PRs, streaks, workout drops, and progress posts keep the social layer active."
      />

      <View style={styles.stack}>
        {posts.map((post) => {
          const author = users.find((user) => user.id === post.authorId);
          const postComments = comments.filter((comment) => comment.postId === post.id).slice(0, 2);

          if (!author) {
            return null;
          }

          return (
            <SurfaceCard key={post.id}>
              <View style={styles.headerRow}>
                <View style={styles.headerCopy}>
                  <Text style={styles.authorName}>{author.displayName}</Text>
                  <Text style={styles.timestamp}>{formatDateLabel(post.createdAt)} / @{author.username}</Text>
                </View>
                <RankBadge rank={author.rank} />
              </View>

              <Text style={styles.postTitle}>{post.title}</Text>
              <Text style={styles.postCopy}>{post.content}</Text>

              <View style={styles.chipWrap}>
                {post.chips.map((chip) => (
                  <View key={chip} style={styles.chip}>
                    <Text style={styles.chipText}>{chip}</Text>
                  </View>
                ))}
              </View>

              <View style={styles.actionRow}>
                <Pressable style={styles.actionButton} onPress={() => likePost(post.id)}>
                  <Text style={styles.actionText}>Like {post.likeUserIds.length}</Text>
                </Pressable>
                <View style={styles.commentCount}>
                  <Text style={styles.commentCountText}>{post.commentIds.length} comments</Text>
                </View>
              </View>

              <View style={styles.commentStack}>
                {postComments.map((comment) => {
                  const commentAuthor = users.find((user) => user.id === comment.authorId);
                  return (
                    <View key={comment.id} style={styles.commentCard}>
                      <Text style={styles.commentAuthor}>{commentAuthor?.displayName ?? 'GymXP User'}</Text>
                      <Text style={styles.commentCopy}>{comment.content}</Text>
                    </View>
                  );
                })}
              </View>

              <View style={styles.commentComposer}>
                <TextInput
                  value={draftComments[post.id] ?? ''}
                  onChangeText={(value) =>
                    setDraftComments((existing) => ({
                      ...existing,
                      [post.id]: value,
                    }))
                  }
                  placeholder="Add a comment"
                  placeholderTextColor={theme.colors.textDim}
                  style={styles.commentInput}
                />
                <Pressable
                  style={styles.postButton}
                  onPress={() => {
                    addComment(post.id, draftComments[post.id] ?? '');
                    setDraftComments((existing) => ({
                      ...existing,
                      [post.id]: '',
                    }));
                  }}
                >
                  <Text style={styles.postButtonText}>Post</Text>
                </Pressable>
              </View>
            </SurfaceCard>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 22,
    gap: 22,
  },
  stack: {
    gap: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
  },
  authorName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  timestamp: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 4,
  },
  postTitle: {
    color: theme.colors.text,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '800',
    marginTop: 16,
  },
  postCopy: {
    color: theme.colors.textMuted,
    lineHeight: 20,
    marginTop: 8,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
  },
  chipText: {
    color: theme.colors.accent,
    fontWeight: '700',
    fontSize: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceSoft,
  },
  actionText: {
    color: theme.colors.text,
    fontWeight: '700',
  },
  commentCount: {
    justifyContent: 'center',
  },
  commentCountText: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  commentStack: {
    gap: 10,
    marginTop: 14,
  },
  commentCard: {
    padding: 12,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
  },
  commentAuthor: {
    color: theme.colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  commentCopy: {
    color: theme.colors.textMuted,
    marginTop: 6,
    lineHeight: 18,
  },
  commentComposer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  commentInput: {
    flex: 1,
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    color: theme.colors.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  postButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 16,
    borderRadius: theme.radius.pill,
    justifyContent: 'center',
  },
  postButtonText: {
    color: theme.colors.background,
    fontWeight: '800',
  },
});
