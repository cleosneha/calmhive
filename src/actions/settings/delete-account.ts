export async function deleteUserAccount() {
  try {
    const session = await getSession();
    if (!session?.user) {
      return apiError("Unauthorized");
    }

    const userId = session.user.id;

    // Delete plan embeddings from vector store
    try {
      const { deletePlanEmbedding } =
        await import("@/actions/plan/process-embedding");
      const deleteResult = await deletePlanEmbedding(userId);
      if (!deleteResult.success) {
        console.warn(
          "⚠️ Failed to delete plan embeddings:",
          deleteResult.error,
        );
      }
    } catch (error) {
      console.warn("⚠️ Error deleting plan embeddings:", error);
      // Continue with deletion even if embedding cleanup fails
    }

    // Sign out the user first (before deleting from database)
    const headersList = await headers();
    try {
      await auth.api.signOut({
        headers: headersList,
      });
    } catch (error) {
      // Ignore sign out errors, we'll delete the user anyway
      console.warn("Error during sign out (continuing with deletion):", error);
    }

    // Delete all user data from database (cascades to related tables)
    await db.user.delete({
      where: { id: userId },
    });

    return apiResponse({ success: true }, "Account deleted successfully");
  } catch (error) {
    console.error("Error deleting user account:", error);
    return apiError(getErrorMessage(error));
  }
}
