import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function CoachingTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, handleToggleComments, handleLikeComment, handlePostComment, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, setShowFoodSearch, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, loadRecipeReviews
  } = tabProps;

  return (
    <>

          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 w-full h-full min-h-[70vh] flex flex-col max-w-4xl mx-auto bg-zinc-50 rounded-[2.5rem] border border-zinc-200 overflow-hidden shadow-sm relative">
             <div className="bg-white px-6 py-4 border-b border-zinc-200 flex items-center justify-between sticky top-0 z-20 shrink-0">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#39FF14] p-0.5">
                      <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Coach Rokhy" className="w-full h-full object-cover rounded-full bg-black" />
                   </div>
                   <div>
                      <h2 className="font-black text-black uppercase tracking-tighter flex items-center gap-2">Coach Rokhy <span className="w-2 h-2 rounded-full bg-[#39FF14] animate-pulse"></span></h2>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">En ligne</p>
                   </div>
                </div>
             </div>

             <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col custom-scrollbar">
                {/* Initial Bot Message */}
                <div className="flex items-end gap-3 w-full md:w-3/4">
                   <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                      <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Coach Rokhy" className="w-full h-full object-cover bg-black" />
                   </div>
                   <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-bl-sm shadow-sm">
                      <p className="text-sm font-medium text-black">Salut ! C&apos;est Coach Rokhy. Comment se passe ta semaine par rapport à tes objectifs ?</p>
                   </div>
                </div>

                {/* User Reply */}
                {coachingChatStep > 0 && (
                   <div className="flex items-end gap-3 w-full md:w-3/4 self-end flex-row-reverse animate-in fade-in slide-in-from-bottom-2">
                      <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center shrink-0">
                         <User size={16} className="text-zinc-500" />
                      </div>
                      <div className="bg-[#39FF14]/20 border border-[#39FF14]/30 p-4 rounded-2xl rounded-br-sm shadow-sm">
                         <p className="text-sm font-medium text-black">
                            {coachingChatStep === 1 && "Je stagne un peu..."}
                            {coachingChatStep === 2 && "J&apos;ai fait un gros écart !"}
                            {coachingChatStep === 3 && "J&apos;ai une question spécifique."}
                         </p>
                      </div>
                   </div>
                )}

                {/* Bot Response Based on User Reply */}
                {coachingChatStep > 0 && (
                   <div className="flex items-end gap-3 w-full md:w-3/4 animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: '0.5s', animationFillMode: 'both' }}>
                      <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200">
                         <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt="Coach Rokhy" className="w-full h-full object-cover bg-black" />
                      </div>
                      <div className="bg-white border border-zinc-200 p-4 rounded-2xl rounded-bl-sm shadow-sm">
                         {coachingChatStep === 1 && (
                            <>
                               <p className="text-sm font-medium text-black mb-4">La stagnation est normale, ne lâche rien ! As-tu pensé &agrave; remplacer ton riz brisé par du Fonio cette semaine pour relancer la machine sans te priver ?</p>
                               <button onClick={() => handleTabChange('shop')} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-md w-full sm:w-auto flex items-center justify-center gap-2">
                                  🛒 Découvrir le Fonio
                               </button>
                            </>
                         )}
                         {coachingChatStep === 2 && (
                            <>
                               <p className="text-sm font-medium text-black mb-4">Zéro culpabilité ! L&apos;important c&apos;est le prochain repas. Fais-toi une petite infusion de Kinkéliba ou de Bissap sans sucre ce soir pour aider la digestion.</p>
                               <button onClick={() => handleTabChange('today')} className="bg-black text-[#39FF14] px-6 py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-md w-full sm:w-auto flex items-center justify-center gap-2">
                                  💪 Reprendre mon menu
                               </button>
                            </>
                         )}
                         {coachingChatStep === 3 && (
                            <>
                               <p className="text-sm font-medium text-black mb-4">Pas de souci, chaque métabolisme est unique. Discutons-en directement de vive voix pour adapter ton programme.</p>
                               <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="bg-[#25D366] text-white px-6 py-4 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest hover:scale-105 transition-transform shadow-lg w-full flex items-center justify-center gap-2">
                                  <MessageCircle size={20} /> Discuter sur WhatsApp
                               </button>
                            </>
                         )}
                      </div>
                   </div>
                )}
             </div>

             {/* Quick Replies / Choices */}
             <div className="bg-white p-4 border-t border-zinc-200 shrink-0">
                 {coachingChatStep === 0 ? (
                    <div className="flex flex-wrap gap-2 justify-center">
                        <button onClick={() => setCoachingChatStep(1)} className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-black px-4 py-3 rounded-full text-xs font-bold transition-colors">Je stagne un peu...</button>
                        <button onClick={() => setCoachingChatStep(2)} className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-black px-4 py-3 rounded-full text-xs font-bold transition-colors">J&apos;ai fait un gros écart !</button>
                        <button onClick={() => setCoachingChatStep(3)} className="bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-black px-4 py-3 rounded-full text-xs font-bold transition-colors">J&apos;ai une question spécifique.</button>
                    </div>
                 ) : (
                    <div className="flex justify-center">
                        <button onClick={() => setCoachingChatStep(0)} className="text-zinc-400 hover:text-black text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-colors"><RotateCcw size={14}/> Recommencer</button>
                    </div>
                 )}
             </div>
          </div>

    </>
  );
}
