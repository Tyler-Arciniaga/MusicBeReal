import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  Linking,
  type ViewToken,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { createPostLike } from "@/services/postService";
import { useAuth } from "@/contexts/AuthContext";

//TODO: (low) The styling is like so ever slightly off,
//try to align the left side just a little bit better and space things
//a little bit better

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface PostType {
  id: string;
  username: string;
  name: string;
  artist: string;
  cover: string;
  caption: string;
  uri: string;
  likes: number;
  comments: number;
  postLikes: PostLikes[];
}

interface PostLikes {
  id: string;
  post_id: string;
  user_id: string;
}

const PostCard = ({ post }: { post: PostType }) => {
  const { user } = useAuth();
  const [likes, setLikes] = useState<PostLikes[]>([]);

  useEffect(() => {
    setLikes(post.postLikes);
  }, []);

  const openSpotify = () => {
    if (post.uri) {
      // Try to open the Spotify app with the URI
      Linking.canOpenURL(post.uri)
        .then((supported) => {
          if (supported) {
            return Linking.openURL(post.uri);
          } else {
            // Fallback to web version if app isn't installed
            return Linking.openURL(
              `https://open.spotify.com/track/${post.uri.split(":").pop()}`
            );
          }
        })
        .catch((err) => console.error("An error occurred", err));
    }
  };

  const handlePostLike = async () => {
    let like = {
      user_id: user?.id,
      post_id: post.id,
    };
    console.log(like);
    let res = await createPostLike(like);
    console.log(res);
    if (!res.success) {
      Alert.alert("Issue Liking Post", res.msg);
    }
  };

  const handleComment = () => {
    console.log("Comment button pressed");
  };

  return (
    <View style={styles.postContainer}>
      <View style={styles.postHeader}>
        <Image
          source={{ uri: "https://picsum.photos/200" }}
          style={styles.avatar}
        />
        <Text style={styles.username}>{post.username}</Text>
      </View>
      <Image source={{ uri: post.cover }} style={styles.albumCover} />
      <View style={styles.songInfo}>
        <Text style={styles.songName}>{post.name}</Text>
        <Text style={styles.artistName}>{post.artist}</Text>

        {/* Spotify button */}
        {post.uri && (
          <TouchableOpacity style={styles.spotifyButton} onPress={openSpotify}>
            <Feather name="music" size={16} color="white" />
            <Text style={styles.spotifyButtonText}>Listen on Spotify</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={styles.caption}>{post.caption}</Text>
      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handlePostLike}>
          <Feather name="heart" size={24} color="black" />
          <Text style={styles.actionText}>{post.postLikes.length}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Feather
            name="message-circle"
            size={24}
            color="black"
            onPress={handleComment}
          />
          <Text style={styles.actionText}>{post.comments}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f0f0",
  },
  postContainer: {
    height: screenHeight,
    width: screenWidth,
    backgroundColor: "white",
    padding: 15,
    justifyContent: "center",
  },
  postHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    fontWeight: "bold",
    fontSize: 16,
  },
  albumCover: {
    width: "100%",
    height: screenHeight * 0.4,
    resizeMode: "cover",
    borderRadius: 10,
    marginBottom: 10,
  },
  songInfo: {
    marginBottom: 5,
  },
  songName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  artistName: {
    fontSize: 16,
    color: "#666",
    marginBottom: 10,
  },
  spotifyButton: {
    backgroundColor: "#1DB954", // Spotify green
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
    marginTop: 5,
  },
  spotifyButtonText: {
    color: "white",
    fontWeight: "bold",
    marginLeft: 5,
    fontSize: 12,
  },
  caption: {
    fontSize: 14,
    marginBottom: 10,
    marginTop: 10,
  },
  actionsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionText: {
    marginLeft: 5,
  },
  addButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#1DB954", // Spotify green
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
  },
});

export default PostCard;
