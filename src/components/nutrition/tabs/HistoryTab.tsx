import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function HistoryTab({ ...tabProps }: any) {
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, handleToggleComments, handleLikeComment, handlePostComment, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, setShowFoodSearch, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress, loadRecipeReviews
  } = tabProps;

  return (
    <>

          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full">
             {/* NOUVELLE SECTION BADGES 3D */}
             <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm mb-8 w-full mt-6">
                <h3 className="text-xl font-black uppercase text-black mb-6 flex items-center gap-2"><Trophy className="text-yellow-500" size={24}/> Mes Badges & Trophées</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 w-full">
                   {[
                     { id: 'Force Baobab', xp: 0, img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493020/FORCE_BAOBAB_ltcuer.png' },
                     { id: 'Maître du Fonio', xp: 100, img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493020/MAITRE_DU_FONIO_emczhf.png' },
                     { id: 'Lekkologue Or', xp: 500, img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493019/LEKKOLOGUE_OR_a0znxt.png' },
                     { id: 'Légende', xp: 1000, img: 'https://res.cloudinary.com/dtr2wtoty/image/upload/v1784493019/LEGENDE_z4ipny.png' }
                   ].map(badge => {
                     const isUnlocked = jongomaXP >= badge.xp;
                     return (
                       <div key={badge.id} className={`flex flex-col items-center justify-center p-4 rounded-3xl border-2 transition-all duration-300 relative ${isUnlocked ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-400 shadow-md' : 'bg-zinc-50 border-zinc-200 opacity-60 grayscale'}`}>
                         {!isUnlocked && <Lock size={16} className="absolute top-4 right-4 text-zinc-400"/>}
                         <img src={badge.img} className="w-20 h-20 md:w-28 md:h-28 object-contain mb-4 drop-shadow-xl" alt={badge.id} />
                         <span className={`text-[11px] font-black uppercase text-center leading-tight tracking-widest ${isUnlocked ? 'text-orange-600' : 'text-zinc-500'}`}>{badge.id}</span>
                         <span className={`text-[9px] font-bold uppercase mt-1 ${isUnlocked ? 'text-yellow-600' : 'text-zinc-400'}`}>{isUnlocked ? 'Débloqué' : `${badge.xp} XP Requis`}</span>
                       </div>
                     )
                   })}
                </div>
             </div>


            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <h2 className={`${spaceGrotesk.className} text-2xl font-black uppercase tracking-tighter text-black flex items-center gap-3 mb-8`}>
                  <BarChartIcon className="text-[#39FF14]" /> Évolution sur 7 jours
               </h2>

               <div className="grid md:grid-cols-2 gap-8">
                  {/* GRAPHIQUE : Hydratation */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><Droplet size={16}/> Hydratation (ml)</h3>
                     <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({length: 7}, (_, i) => {
                           const d = new Date();
                           d.setDate(d.getDate() - (6 - i));
                           const dateStr = d.toISOString().split('T')[0];
                           const log = (Array.isArray(dailyLogs) ? dailyLogs : []).find(l => l.log_date === dateStr);
                           const count = log?.water_glasses || 0;
                           const heightPct = Math.min((count / 8) * 100, 100);
                           return (
                              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                 <div className="w-full max-w-[30px] bg-blue-500 rounded-t-lg transition-all duration-500 relative group-hover:bg-blue-400" style={{ height: `${heightPct}%`, minHeight: '4px' }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       {count} verres
                                    </div>
                                 </div>
                                 <span className="mt-3 text-[10px] font-bold text-zinc-400 uppercase">{d.toLocaleDateString('fr-FR', {weekday:'short'})}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>

                  {/* GRAPHIQUE : Calories */}
                  <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <h3 className="text-sm font-black uppercase text-zinc-500 mb-6 flex items-center gap-2"><Flame size={16}/> Calories Consommées</h3>
                     <div className="flex items-end justify-between h-40 gap-2">
                        {Array.from({length: 7}, (_, i) => {
                           const d = new Date();
                           d.setDate(d.getDate() - (6 - i));
                           const dateStr = d.toISOString().split('T')[0];
                           const log = (Array.isArray(dailyLogs) ? dailyLogs : []).find(l => l.log_date === dateStr);
                           const count = log?.calories_consumed || 0;
                           const target = calorieGoal;
                           const heightPct = count > 0 ? Math.min((count / target) * 100, 100) : 0;
                           return (
                              <div key={i} className="flex flex-col items-center flex-1 h-full justify-end group">
                                 <div className={`w-full max-w-[30px] rounded-t-lg transition-all duration-500 relative ${count > target ? 'bg-red-500 group-hover:bg-red-400' : 'bg-orange-500 group-hover:bg-orange-400'}`} style={{ height: `${heightPct}%`, minHeight: '4px' }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                       {count} kcal
                                    </div>
                                 </div>
                                 <span className="mt-3 text-[10px] font-bold text-zinc-400 uppercase">{d.toLocaleDateString('fr-FR', {weekday:'short'})}</span>
                              </div>
                           );
                        })}
                     </div>
                  </div>
               </div>
            </div>

            {/* LISTE DES BILANS */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
               <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                 <h2 className={`${spaceGrotesk.className} text-2xl md:text-4xl font-black uppercase tracking-tighter text-black flex items-center gap-4`}><img src={MENU_ICONS.dashboard} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl object-cover shrink-0 shadow-lg" alt="Historique" onError={(e: any) => e.target.src="https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/Ceramic_plate_with_herbs_on_202608071304_bl72q1.jpg"} /> Historique des Bilans</h2>
                 <button onClick={downloadHistoryPDF} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-transform shadow-md flex items-center gap-2">
                    <Download size={14}/> Exporter (PDF)
                 </button>
               </div>
               <div className="space-y-4">
                  {Array.from({length: 7}).map((_, idx) => {
                     const d = new Date();
                     d.setDate(d.getDate() - idx);
                     const dateStr = d.toISOString().split('T')[0];
                     const log = (Array.isArray(dailyLogs) ? dailyLogs : []).find(l => l.log_date === dateStr);

                     if (log && log.report_data) {
                         return (
                             <div key={idx} className="bg-zinc-50 p-5 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                   <p className="font-black text-sm text-black mb-1">{d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                   <div className="flex flex-wrap gap-2 mt-2">
                                      {log.report_data?.followedMenu ? <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-[10px] font-black uppercase">Menu suivi</span> : <span className="bg-zinc-200 text-zinc-600 px-2 py-1 rounded text-[10px] font-black uppercase">Non suivi</span>}
                                      {log.report_data?.drankWater ? <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-[10px] font-black uppercase">Eau respectée</span> : null}
                                      {log.report_data?.cravedRice ? <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-[10px] font-black uppercase">Craquage</span> : null}
                                   </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm font-bold text-zinc-500">
                                   <span className="flex items-center gap-1 text-zinc-600"><img src={CALS_ICON} className="w-4 h-4 rounded-full shadow-sm"/> {log.calories_consumed || 0} kcal</span>
                                   <span className="flex items-center gap-1 text-zinc-600"><img src={WATER_ICON} className="w-4 h-4 rounded-full shadow-sm"/> {log.water_glasses || 0}/8</span>
                                </div>
                             </div>
                         );
                     } else {
                         return (
                             <div key={idx} className="bg-white p-5 rounded-2xl border border-zinc-100 flex flex-col md:flex-row md:items-center justify-between gap-4 opacity-80">
                                <div>
                                   <p className="font-black text-sm text-black mb-1">{d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                   <div className="flex flex-wrap gap-2 mt-2">
                                      <span className="bg-zinc-100 text-zinc-400 px-2 py-1 rounded text-[10px] font-black uppercase">Non suivi</span>
                                   </div>
                                </div>
                                <div className="flex items-center justify-between md:justify-end gap-6 text-sm font-bold text-zinc-500 w-full md:w-auto mt-4 md:mt-0">
                                   <div className="flex items-center gap-4">
                                      <span className="flex items-center gap-1 text-zinc-400"><img src={CALS_ICON} className="w-4 h-4 rounded-full shadow-sm grayscale opacity-50"/> 0 kcal</span>
                                      <span className="flex items-center gap-1 text-zinc-400"><img src={WATER_ICON} className="w-4 h-4 rounded-full shadow-sm grayscale opacity-50"/> 0/8</span>
                                   </div>
                                   <button onClick={() => {
                                       setSelectedReportDate(dateStr);
                                       setShowDailyReport(true);
                                   }} className="bg-black text-[#39FF14] px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest animate-pulse hover:scale-105 transition-transform shadow-[0_0_15px_rgba(57,255,20,0.3)]">
                                      Rattraper
                                   </button>
                                </div>
                             </div>
                         );
                     }
                  })}
               </div>
            </div>
          </div>

    </>
  );
}
