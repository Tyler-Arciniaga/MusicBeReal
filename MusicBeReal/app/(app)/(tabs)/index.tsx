import { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Dimensions,
  type ViewToken,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Post from "../../../components/postCard";
import { useAuth } from "@/contexts/AuthContext";
import { fetchPosts } from "@/services/postService";

// Get the screen dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const mockPosts = [
  {
    id: "1",
    username: "user1",
    songName: "Blinding Lights",
    artist: "The Weeknd",
    cover: "https://example.com/album1.jpg",
    caption: "This song is fire! 🔥",
    likes: 42,
    comments: 7,
  },
  {
    id: "2",
    username: "user2",
    songName: "Shape of You",
    artist: "Ed Sheeran",
    cover: "https://example.com/album2.jpg",
    caption: "Perfect for my workout playlist 💪",
    likes: 38,
    comments: 5,
  },
];
interface PostType {
  id: string;
  username: string;
  songName: string;
  artist: string;
  cover: string;
  caption: string;
  likes: number;
  comments: number;
}

const HomeScreen = () => {
  const { user, setAuth } = useAuth();
  const flatListRef = useRef<FlatList<PostType>>(null);
  const [posts, setPosts] = useState();

  const getPosts = async () => {
    console.log("Fetching posts...");
    let res = await fetchPosts();
    console.log("Fetch post results:", res);
  };

  useEffect(() => {
    getPosts();
  }, []);

  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        console.log("Current visible item:", viewableItems[0].item);
      }
    }
  );

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={mockPosts}
        renderItem={({ item }) => <Post post={item} />}
        keyExtractor={(item) => item.id}
        pagingEnabled
        snapToInterval={screenHeight}
        decelerationRate="fast"
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged.current}
        viewabilityConfig={{
          itemVisiblePercentThreshold: 50,
        }}
      />
      <TouchableOpacity style={styles.addButton}>
        <Feather name="plus" size={24} color="white" />
      </TouchableOpacity>
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
  },
  caption: {
    fontSize: 14,
    marginBottom: 10,
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

export default HomeScreen;
