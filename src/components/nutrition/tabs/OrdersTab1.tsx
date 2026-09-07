import React from 'react';
import { X, Bookmark, Send, User, TrendingDown, Dumbbell, TrendingUp, ArrowRight, MoreHorizontal, HeartPulse, MessageCircle, RotateCcw, ChevronDown, UserIcon, LogOut, ChevronLeft, ChevronRight, Download, Lock, CheckCircle, Check, Sun, Moon, Activity, Calendar, Clock, Sparkles, Droplet, Flame, Target, ListChecks, Utensils, RefreshCcw, Compass, BarChart as BarChartIcon, LineChart as LineChartIcon, Settings, Save, Award, AlertCircle, Search, Trash2, Info, ShoppingCart, Scale, Camera, ImageIcon, Trophy, CreditCard, ScanLine, Loader2, ExternalLink, MenuIcon, PanelLeftClose, PanelLeftOpen, ShoppingBag, Tag, Filter, Star, BookOpen, Heart, Box, Eye, EyeOff, Share2, AlertTriangle, Package, Minus, Plus, PlusCircle, Gift, Apple, Video, MessageSquare, Bell, Volume2, VolumeX, WifiOff, FileText, Edit3, PartyPopper, Instagram, Facebook, Twitter, Coffee, Leaf, Users } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { YAxis, ResponsiveContainer, AreaChart, PieChart, Pie, LineChart, XAxis, ReferenceLine, Cell, Bar, Line, BarChart, Tooltip as RechartsTooltip, CartesianGrid, Area } from 'recharts';
import BentoDashboardView from '@/components/dashboard/BentoDashboardView';
import ClientFitnessView from "@/components/nutrition/ClientFitnessView";

// @ts-nocheck
export default function OrdersTab1({ ...tabProps }: any) {
  const [showOrderModal, setShowOrderModal] = React.useState(false);
  const [selectedOrder, setSelectedOrder] = React.useState<any>(null);
  const {
    today, todayStr, router, searchParams, photoInputRef, mealPhotoInputRef, thiernoChatEndRef, thiernoVoiceRef, sidebarTimeoutRef, toggleThiernoVoice, speakText, processThiernoReply, sendWaterReminderPush, storyInputRef, handleArticleClick, togglePushNotifications, imcValue, user, setUser, clientProfile, setClientProfile, loading, setLoading, daysLeft, setDaysLeft, theme, setTheme, activeTab, setActiveTab, blogCategory, setBlogCategory, blogSearch, setBlogSearch, trackingMode, setTrackingMode, dailyLogs, setDailyLogs, showRedoDiagModal, setShowRedoDiagModal, redoReason, setRedoReason, showPaymentModal, setShowPaymentModal, isScanning, setIsScanning, barcodeInput, setBarcodeInput, toastMessage, setToastMessage, isPhotoScanning, setIsPhotoScanning, calories, setCalories, waterGlasses, setWaterGlasses, bmr, setBmr, proteins, setProteins, carbs, setCarbs, fats, setFats, showDailyReport, setShowDailyReport, selectedReportDate, setSelectedReportDate, showExitIntentModal, setShowExitIntentModal, intendedTab, setIntendedTab, reportData, setReportData, isSubmittingReport, setIsSubmittingReport, consumedMeals, setConsumedMeals, moods, setMoods, moodNotes, setMoodNotes, selectedMealModal, setSelectedMealModal, selectedMealPhoto, setSelectedMealPhoto, foodSearchQuery, setFoodSearchQuery, offResults, setOffResults, isSearchingOFF, setIsSearchingOFF, selectedFoodDB, setSelectedFoodDB, foodQuantity, setFoodQuantity, foodDatabaseDB, setFoodDatabaseDB, foodUnit, setFoodUnit, allRecipesDB, setAllRecipesDB, recipeFilter, setRecipeFilter, selectedRecipeDetail, setSelectedRecipeDetail, recipeDetailTab, setRecipeDetailTab, recipeReviews, setRecipeReviews, userRating, setUserRating, userComment, setUserComment, isSubmittingReview, setIsSubmittingReview, hasUserReviewed, setHasUserReviewed, rokhyMessage, setRokhyMessage, isThiernoChatOpen, setIsThiernoChatOpen, isThiernoDismissed, setIsThiernoDismissed, thiernoUserReply, setThiernoUserReply, coachingChatStep, setCoachingChatStep, thiernoMessages, setThiernoMessages, isThiernoVoiceEnabled, setIsThiernoVoiceEnabled, diagStep, setDiagStep, isSubmittingDiag, setIsSubmittingDiag, diagData, setDiagData, forceTarget, setForceTarget, jongomaXP, setJongomaXP, weightLogs, setWeightLogs, newWeight, setNewWeight, showWeightModal, setShowWeightModal, currentWeightInput, setCurrentWeightInput, showConfetti, setShowConfetti, weightCoachMessage, setWeightCoachMessage, coachFeedback, setCoachFeedback, newPostText, setNewPostText, showLeaderboard, setShowLeaderboard, leaderboardData, setLeaderboardData, newPostImage, setNewPostImage, newPostVideo, setNewPostVideo, postMode, setPostMode, textBgIndex, setTextBgIndex, locationName, setLocationName, taggedFriends, setTaggedFriends, uploadingImage, setUploadingImage, communityPosts, setCommunityPosts, stories, setStories, groupedStories, setGroupedStories, isUploadingStory, setIsUploadingStory, storyPreviewFile, setStoryPreviewFile, storyPreviewUrl, setStoryPreviewUrl, storyCaption, setStoryCaption, viewerActiveGroupIndex, setViewerActiveGroupIndex, viewerActiveStoryIndex, setViewerActiveStoryIndex, isViewerPaused, setIsViewerPaused, isVideoMuted, setIsVideoMuted, viewerProgress, setViewerProgress, favoriteMeals, setFavoriteMeals, favoriteSearchQuery, setFavoriteSearchQuery, activeReactionPostId, setActiveReactionPostId, followedUsers, setFollowedUsers, isSaving, setIsSaving, activeChallenge, setActiveChallenge, showChallengeModal, setShowChallengeModal, isParticipating, setIsParticipating, challengeParticipants, setChallengeParticipants, earnedBadges, setEarnedBadges, notifications, setNotifications, pdfHistory, setPdfHistory, activeMenuPostId, setActiveMenuPostId, showSavedOnly, setShowSavedOnly, showCommentsPostId, setShowCommentsPostId, postComments, setPostComments, newCommentText, setNewCommentText, isSharingPDF, setIsSharingPDF, xpAnimation, setXpAnimation, showFirstBadgeModal, setShowFirstBadgeModal, showSecondBadgeModal, setShowSecondBadgeModal, calorieGoal, setCalorieGoal, proteinGoal, setProteinGoal, carbsGoal, setCarbsGoal, fatsGoal, setFatsGoal, isFastingMode, setIsFastingMode, isExpertMode, setIsExpertMode, weeklyGeneratedMenu, setWeeklyGeneratedMenu, showGroceryList, setShowGroceryList, excludedIngredients, setExcludedIngredients, profileForm, setProfileForm, showReminder, setShowReminder, welcomeMessage, setWelcomeMessage, isSidebarOpen, setIsSidebarOpen, isMobileMenuOpen, setIsMobileMenuOpen, showMobileHub, setShowMobileHub, myFollowersCount, setMyFollowersCount, selectedShopGoal, setSelectedShopGoal, selectedProduct, setSelectedProduct, shopDataDB, setShopDataDB, showOrderSuccessModal, setShowOrderSuccessModal, createdOrderRef, setCreatedOrderRef, userOrders, setUserOrders, shopPromoCodesDB, setShopPromoCodesDB, productMediaView, setProductMediaView, productActiveImage, setProductActiveImage, showZoneSuggestions, setShowZoneSuggestions, clientOrders, setClientOrders, hasTriggeredCartExit, setHasTriggeredCartExit, isCartBouncing, setIsCartBouncing, scratchedBlocks, setScratchedBlocks, shopBannerUrl, setShopBannerUrl, shopSearchQuery, setShopSearchQuery, shopMinPrice, setShopMinPrice, shopMaxPrice, setShopMaxPrice, articles, setArticles, pushEnabled, setPushEnabled, isOffline, setIsOffline, shopCart, addToCart, savedShopProducts, setGlobalShopProducts, setSavedShopProducts, handleLogout, generateWeeklyMenu, handleDailyReportSubmit, handleRefreshMeal, calculateWaterGoal, calculateProgress, calculateMacroPercentage, getMenuForDay, formatPrice, handleOrder, addToCartCustom, handleCheckout, handleApplyPromoCode, handleProductClick, handleStoryClick, handleCloseViewer, handleNextStory, handlePrevStory, pauseStory, resumeStory, handleStoryMediaClick, handleLikePost, handlePostSubmit, handleCommentSubmit, handleDeletePost, handleFollowUser, fetchLeaderboard, handleStoryUpload, closeStoryPreview, publishStory, openMealModal, handleCloseMealModal, handleSearchFood, handleAddFood, handleMealPhotoUpload, analyzeMealPhoto, handleWeightSubmit, generatePDFMenu, handleSaveChallenge, handleJoinChallenge, handleOpenRecipe, handleCloseRecipe, handleRecipeReviewSubmit, addThiernoMessage, simulateThiernoResponse, handleThiernoVoiceInput, handleThiernoDismiss, handleClearHistory, handleRedoDiagnostic, handleOfflineStatus, fetchPosts, fetchStories, handleTabChange, greetingText, greetingSubtext, lvlInfo, openLeaderboard, handleUpdateWater, todayPlan, deleteMealLog, spaceGrotesk, toggleFavorite, CALS_ICON, PROTEINS_ICON, MENU_ICONS, downloadHistoryPDF, WATER_ICON, handleChangeAvatar, handleSaveProfile, emblaNewArrivalsRef, openProductModal, SHOP_GOALS, toggleSaveProduct, handleTrackingModeChange, remainingCalories, targetCalories, CARBS_ICON, FATS_ICON, formattedCurrentDay, confirmMealLog, handleSwapMeal, crossSellProducts, downloadGroceryListPDF, guessVisualPortion, getGroceryList, weeklyMenus, handleDeleteWeight, handleSaveWeight, clearCart, setShopPromoCode, setSelectedArticle, selectedArticle, emblaBlogRef, TEXT_BACKGROUNDS, handleImageUpload, handlePostCommunity, handleRepost, handleBookmarkPost, supabase, updateCartQuantity, handleMealClick, removeFromCart, deliveryCost, deliveryAddress, setDeliveryAddress } = tabProps;

  return (
    <>

           <div className="space-y-8 animate-in fade-in slide-in-from-right-4 w-full max-w-4xl mx-auto">
              <button onClick={() => handleTabChange('shop')} className="flex items-center gap-2 text-zinc-500 hover:text-black font-black uppercase text-[10px] tracking-widest mb-6"><ChevronLeft size={16}/> Retour à la boutique</button>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                  <div>
                      <h2 className="text-3xl font-black uppercase tracking-tighter text-black">Suivi des commandes</h2>
                      <p className="text-zinc-500 font-bold text-sm">Gérez et suivez l'état de vos livraisons.</p>
                  </div>
              </div>

              {clientOrders.length === 0 ? (
                  <div className="bg-white rounded-[2rem] p-12 text-center shadow-sm border border-zinc-200">
                      <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-6 text-zinc-400">
                          <Package size={40} />
                      </div>
                      <h3 className="text-xl font-black uppercase text-black mb-2">Aucune commande</h3>
                      <p className="text-zinc-500 font-bold mb-6">Vous n'avez pas encore passé de commande.</p>
                      <button onClick={() => handleTabChange('shop')} className="bg-[#39FF14] text-black px-6 py-3 rounded-xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-transform">Explorer la boutique</button>
                  </div>
              ) : (
                  <div className="flex flex-col gap-4">
                      {clientOrders.map((order: any) => (
                          <div key={order.id} onClick={() => { setSelectedOrder(order); setShowOrderModal(true); }} className="bg-white border border-zinc-200 rounded-[2rem] p-6 shadow-sm hover:shadow-md transition-shadow cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative overflow-hidden group">
                              <div className="absolute top-0 left-0 w-2 h-full bg-black group-hover:bg-[#39FF14] transition-colors"></div>
                              <div className="flex-1 pl-4">
                                  <div className="flex items-center gap-3 mb-2">
                                      <span className="bg-zinc-100 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">#{order.id.substring(0,8).toUpperCase()}</span>
                                      <span className="text-xs font-bold text-zinc-500">{new Date(order.created_at).toLocaleDateString('fr-FR', {day: 'numeric', month: 'long', year: 'numeric'})}</span>
                                  </div>
                                  <p className="font-bold text-sm text-black mb-1 line-clamp-1">
                                      {(order.items || []).map((i: any) => `${i.quantity}x ${i.nom}`).join(', ')}
                                  </p>
                                  <p className="font-black text-lg text-[#39FF14]">{order.total?.toLocaleString() || 0} F</p>
                              </div>
                              <div className="flex items-center gap-4 shrink-0 pl-4 sm:pl-0 border-t sm:border-t-0 sm:border-l border-zinc-100 pt-4 sm:pt-0">
                                  <div className="flex flex-col items-start sm:items-end gap-1">
                                      <span className="text-[9px] font-black uppercase text-zinc-400">Statut</span>
                                      {order.status === 'NOUVEAU' ? (
                                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Clock size={12}/> Nouveau</span>
                                      ) : order.status === 'EN PREPARATION' ? (
                                          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Package size={12}/> En Préparation</span>
                                      ) : order.status === 'EXPEDIE' ? (
                                          <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><Package size={12}/> Expédié</span>
                                      ) : order.status === 'LIVRE' ? (
                                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><CheckCircle size={12}/> Livré</span>
                                      ) : (
                                          <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1"><X size={12}/> Annulé</span>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>
              )}

              {/* Support flottant WhatsApp */}
              <button onClick={() => window.open('https://wa.me/221785338417', '_blank')} className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 bg-[#25D366] text-white p-4 rounded-full shadow-[0_10px_30px_rgba(37,211,102,0.4)] hover:scale-110 transition-transform z-50 flex items-center justify-center">
                  <MessageCircle size={28}/>
              </button>

              {/* Modale Détails de Commande Client */}
              {showOrderModal && selectedOrder && (
                  <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4 animate-in fade-in" onClick={(e) => { if (e.target === e.currentTarget) setShowOrderModal(false); }}>
                      <div className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col relative shadow-2xl">
                          <div className="p-8 shrink-0 border-b border-zinc-100 flex justify-between items-start">
                              <div>
                                  <h3 className="text-2xl font-black uppercase tracking-tight text-black flex items-center gap-2"><Package className="text-[#39FF14]"/> Commande #{selectedOrder.id.substring(0,8).toUpperCase()}</h3>
                                  <p className="text-xs text-zinc-500 font-bold">{new Date(selectedOrder.created_at).toLocaleString('fr-FR')}</p>
                              </div>
                              <button onClick={() => setShowOrderModal(false)} className="p-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 rounded-full transition-colors"><X size={20}/></button>
                          </div>

                          <div className="p-8 flex-1 overflow-y-auto overscroll-contain">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Détails de livraison</h4>
                                      <p className="font-bold text-sm text-black">{selectedOrder.address || selectedOrder.delivery_address || 'Non spécifiée'}</p>
                                  </div>
                                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 flex flex-col justify-center items-start">
                                      <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Statut</h4>
                                      <span className="bg-black text-[#39FF14] px-3 py-1 rounded-lg text-xs font-black uppercase">{selectedOrder.status}</span>
                                  </div>
                              </div>

                              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 border-b border-zinc-100 pb-2">Articles commandés</h4>
                              <div className="space-y-4">
                                  {(selectedOrder.items || []).map((item: any, idx: number) => (
                                      <div key={idx} className="flex items-center gap-4 p-4 bg-zinc-50 rounded-xl border border-zinc-100">
                                          <img src={item.image_url || "https://res.cloudinary.com/dtr2wtoty/image/upload/v1786107893/placeholder.jpg"} alt={item.nom || item.name} className="w-16 h-16 object-cover rounded-lg bg-zinc-200" />
                                          <div className="flex-1">
                                              <p className="font-bold text-sm text-black">{item.nom || item.name || 'Produit'}</p>
                                              <p className="text-xs text-zinc-500 font-bold">Quantité: {item.quantity}</p>
                                          </div>
                                          <p className="font-black text-[#39FF14]">{(item.finalPrice || item.price || 0).toLocaleString()} F</p>
                                      </div>
                                  ))}
                              </div>
                          </div>
                          <div className="p-6 shrink-0 border-t border-zinc-100 bg-zinc-50 rounded-b-[2rem] flex justify-between items-center">
                              <span className="font-black text-sm uppercase text-zinc-500">Total payé</span>
                              <span className="font-black text-2xl text-black">{selectedOrder.total?.toLocaleString() || 0} F</span>
                          </div>
                      </div>
                  </div>
              )}

           </div>

    </>
  );
}
