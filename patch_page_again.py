import re

with open('src/app/nutrition/page.tsx', 'r') as f:
    content = f.read()

# Add missing handlePostComment parameter to CommunityTab props
old_props = """    updateCartQuantity,
    clearCart,
    setShowConfetti,

    isShopPromoApplied,
    appliedPromoData,
    shopPromoCode,
    applyShopPromo,
    removePromo,
    setShopPromoCode,
    handleOpenOrderDetails,

    lvlInfo,
    openLeaderboard,
    handleUpdateWater,
    handleTabChange,
    handleMealClick,
    todayPlan,
    deleteMealLog,

    toggleFavorite,
    downloadHistoryPDF,
    handleChangeAvatar,
    handleSaveProfile,
    emblaNewArrivalsRef,
    openProductModal,
    toggleSaveProduct,
    handleTrackingModeChange,
    remainingCalories,
    targetCalories,
    formattedCurrentDay,
    confirmMealLog,
    handleSwapMeal,

    crossSellProducts,
    downloadGroceryListPDF,
    getGroceryList,
    weeklyMenus,
    handleDeleteWeight,
    handleSaveWeight,
    setSelectedArticle,
    selectedArticle,
    emblaBlogRef,
    TEXT_BACKGROUNDS,
    handleImageUpload,
    handlePostCommunity,
    handleFollowUser,
    handleDeletePost,
    handleLikePost,
    handleRepost,
    handleBookmarkPost,

    };"""

new_props = """    updateCartQuantity,
    clearCart,
    setShowConfetti,

    isShopPromoApplied,
    appliedPromoData,
    shopPromoCode,
    applyShopPromo,
    removePromo,
    setShopPromoCode,
    handleOpenOrderDetails,

    lvlInfo,
    openLeaderboard,
    handleUpdateWater,
    handleTabChange,
    handleMealClick,
    todayPlan,
    deleteMealLog,

    toggleFavorite,
    downloadHistoryPDF,
    handleChangeAvatar,
    handleSaveProfile,
    emblaNewArrivalsRef,
    openProductModal,
    toggleSaveProduct,
    handleTrackingModeChange,
    remainingCalories,
    targetCalories,
    formattedCurrentDay,
    confirmMealLog,
    handleSwapMeal,

    crossSellProducts,
    downloadGroceryListPDF,
    getGroceryList,
    weeklyMenus,
    handleDeleteWeight,
    handleSaveWeight,
    setSelectedArticle,
    selectedArticle,
    emblaBlogRef,
    TEXT_BACKGROUNDS,
    handleImageUpload,
    handlePostCommunity,
    handleFollowUser,
    handleDeletePost,
    handleLikePost,
    handleRepost,
    handleBookmarkPost,
    handlePostComment,

    };"""

content = content.replace(old_props, new_props)

with open('src/app/nutrition/page.tsx', 'w') as f:
    f.write(content)

print("page.tsx updated again!")
