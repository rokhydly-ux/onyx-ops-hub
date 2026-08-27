import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function BlogListTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress } = tabProps;

  return (
    <>


          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
             {/* CAROUSEL HEADER START */}
             <div className="w-full relative rounded-[2rem] overflow-hidden" ref={emblaBlogRef}>
               <div className="flex">
                 {articles.slice(0, 3).map((article: any) => (
                   <div key={article.id} className="flex-[0_0_100%] min-w-0 relative h-[400px] md:h-[500px] cursor-pointer group" onClick={() => handleArticleClick(article)}>
                     <img src={article.image_url || 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1781444566/supprimer_le_frame__remplace_le_202606141341_ayzsoe.jpg'} alt={article.title} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                     <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-8 md:p-12">
                       <div className="max-w-3xl backdrop-blur-sm bg-black/20 p-6 rounded-[2rem] border border-white/10 relative">
                         <div className="flex items-center gap-3 mb-4">
                           <span className="bg-[#39FF14] text-black px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">{article.category || 'Nutrition'}</span>
                           <span className="bg-black/50 text-white border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 backdrop-blur-md"><Clock size={12}/> {article.readTime || `${Math.max(1, Math.ceil(((article.content || article.desc || '').split(' ').length) / 200))} min`}</span>
                           <span className="bg-black/50 text-white border border-white/10 px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1 backdrop-blur-md"><Eye size={12}/> {article.views_count || 0} vues</span>
                         </div>
                         <h2 className={`${spaceGrotesk.className} text-3xl md:text-5xl font-black uppercase text-white mb-4 leading-tight group-hover:text-[#39FF14] transition-colors`}>{article.title}</h2>
                         <p className="text-zinc-300 text-sm md:text-base font-medium line-clamp-2 mb-6 max-w-2xl">{article.desc}</p>
                         <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                             <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt={article.author_name || 'Coach Rokhy'} className="w-10 h-10 rounded-full border-2 border-white/20 object-cover bg-black" />
                             <div>
                               <p className="text-white text-xs font-bold uppercase tracking-widest">{article.author_name || 'Coach Rokhy'}</p>
                               <p className="text-[#39FF14] text-[9px] font-black uppercase">Expert Nutrition</p>
                             </div>
                           </div>
                           <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white group-hover:bg-[#39FF14] group-hover:text-black transition-colors backdrop-blur-md">
                             <ArrowRight size={20} className="-rotate-45" />
                           </div>
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
                 {articles.length === 0 && (
                   <div className="flex-[0_0_100%] min-w-0 h-[400px] flex items-center justify-center bg-zinc-900 text-zinc-500 font-bold">Aucun article à la une</div>
                 )}
               </div>
             </div>
             {/* CAROUSEL HEADER END */}

             {/* NAVIGATION & FILTERS START */}
             <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
               <div className="flex items-center gap-2 overflow-x-auto w-full custom-scrollbar pb-2 md:pb-0">
                 {['Tous', 'Nutrition', 'Santé', 'Astuces', 'Témoignages'].map(cat => (
                   <button
                     key={cat}
                     onClick={() => setBlogCategory(cat)}
                     className={`px-5 py-2.5 rounded-full font-bold text-xs uppercase tracking-widest whitespace-nowrap transition-all ${blogCategory === cat ? 'bg-black text-[#39FF14] dark:bg-[#39FF14] dark:text-black border-2 border-transparent' : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700'}`}
                   >
                     {cat}
                   </button>
                 ))}
               </div>
               <div className="relative w-full md:w-72 shrink-0">
                 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
                 <input
                   type="text"
                   placeholder="Rechercher un article..."
                   value={blogSearch}
                   onChange={(e) => setBlogSearch(e.target.value)}
                   className="w-full bg-zinc-100 dark:bg-zinc-800 text-black dark:text-white border-2 border-transparent focus:border-[#39FF14] rounded-full pl-11 pr-4 py-3 text-sm font-bold outline-none transition-all"
                 />
               </div>
             </div>
             {/* NAVIGATION & FILTERS END */}

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {articles
                 .filter((a: any) => blogCategory === 'Tous' || a.category === blogCategory)
                 .filter((a: any) => blogSearch === '' || (a.title && a.title.toLowerCase().includes(blogSearch.toLowerCase())) || (a.desc && a.desc.toLowerCase().includes(blogSearch.toLowerCase())))
                 .map((article: any) => (
                  <div key={article.id} onClick={() => handleArticleClick(article)} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl hover:border-[#39FF14] transition-all cursor-pointer flex flex-col h-full group">
                     {article.image_url && (
                        <div className="overflow-hidden rounded-[2rem] mb-6">
                           <img src={article.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} alt={article.title} className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-500" />
                        </div>
                     )}
                     <div className="flex gap-2 mb-4">
                        <span className="bg-black text-[#39FF14] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{article.category || 'Nutrition'}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Clock size={10}/> {article.readTime || `${Math.max(1, Math.ceil(((article.content || article.desc || '').split(' ').length) / 200))} min`}</span>
                        <span className="bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Eye size={10}/> {article.views_count || 0} vues</span>
                     </div>
                     <h2 className={`${spaceGrotesk.className} text-xl font-black uppercase mb-3 leading-tight text-black dark:text-white group-hover:text-[#39FF14] transition-colors`}>{article.title}</h2>
                     <p className="text-zinc-500 text-xs font-medium mb-6 flex-1 line-clamp-3">{article.desc}</p>
                     <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-center gap-2">
                          <img src="https://i.ibb.co/N6FwP9jD/LOGO-ONYX.png" alt={article.author_name || 'Coach Rokhy'} className="w-6 h-6 rounded-full border border-zinc-200 dark:border-zinc-700 object-cover bg-black" />
                          <span className="text-xs font-bold text-black dark:text-white uppercase tracking-widest">{article.author_name || 'Coach Rokhy'}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-[#39FF14]">
                           LIRE <ArrowRight size={14} className="group-hover:translate-x-2 transition-transform"/>
                        </div>
                     </div>
                  </div>
               ))}
               {articles.filter((a: any) => blogCategory === 'Tous' || a.category === blogCategory).filter((a: any) => blogSearch === '' || (a.title && a.title.toLowerCase().includes(blogSearch.toLowerCase())) || (a.desc && a.desc.toLowerCase().includes(blogSearch.toLowerCase()))).length === 0 && (
                  <div className="col-span-full py-16 text-center text-zinc-400 font-bold border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem]">
                     Aucun article ne correspond à votre recherche.
                  </div>
               )}
             </div>
          </div>

    </>
  );
}
