import { db, storage } from "../../../firebase";

export async function deleteStory(storyId) {
  try {
    // Delete the story from storage
    await storage.ref(`story/${storyId}`).delete();
    // Delete the story from Firestore
    await db.collection("story").doc(storyId).delete();
    console.log("Story deleted successfully");
  } catch (error) {
    console.error("Failed to delete story:", error);
    throw error;
  }
}


// Create a Map to store the timeout IDs
const timeoutMap = new Map();

export default async function deleteStoryHandler(req, res) {
  const { storyId } = req.body;

  try {
    // Get the timestamp of the story
    const storySnapshot = await db.collection("story").doc(storyId).get();
    const { timestamp } = storySnapshot.data();

    // Calculate the elapsed time since upload
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    const elapsedTime = currentTime - timestamp.seconds; // Elapsed time since upload in seconds

    if (elapsedTime < 120) {
      // If elapsed time is less than 2 minutes, set a timeout to delete the story after the remaining time
      const remainingTime = 120 - elapsedTime; // Remaining time in seconds

      const timeoutId = setTimeout(async () => {
        try {
          await deleteStory(storyId, timeoutId); // Pass the timeoutId to the deleteStory function
        } catch (error) {
          console.error("Failed to delete story:", error);
        } finally {
          // Remove the timeoutId from the map after deletion
          timeoutMap.delete(storyId);
        }
      }, remainingTime * 1000); // Convert remaining time to milliseconds

      // Store the timeoutId in the map
      timeoutMap.set(storyId, timeoutId);

      // Return the timeout ID to the client
      res.status(200).json({ timeoutId });
    } else {
      // If elapsed time is 2 minutes or more, delete the story immediately
      await deleteStory(storyId, null); // Pass null as timeoutId
      res.status(200).json({ message: "Story deleted successfully" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete story" });
  }
}
