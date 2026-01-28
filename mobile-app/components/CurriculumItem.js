import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    LayoutAnimation, 
    Platform, 
    UIManager,
    Alert 
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const CurriculumItem = ({ data, isMentor, isEnrolled, onAddContent, onNavigateLesson, onDeleteContent }) => {
    const [expanded, setExpanded] = useState(false);
    const { type, item } = data;

    const toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setExpanded(!expanded);
    };

    const handleAction = (content, itemType) => {
        const isLocked = content.isLocked;

        if (!isMentor) {
            onNavigateLesson(content, isLocked);
            return;
        }

        Alert.alert(
            "Manage Content",
            content.title,
            [
                { text: "View Student View", onPress: () => onNavigateLesson(content, isLocked) },
                { 
                    text: "Edit", 
                    onPress: () => {
                        if (itemType === 'quiz') {
                            onNavigateLesson(content, false);
                        } else {
                            onAddContent(item._id, content.contentType, content);
                        }
                    }
                },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => onDeleteContent(content._id, itemType) 
                },
                { text: "Cancel", style: "cancel" }
            ]
        );
    };

    // RENDER: Standalone Course Quiz (e.g., Final Quiz)
    if (type === 'quiz') {
        const locked = item?.isLocked;
        const completed = item?.isCompleted; // Now synced with backend

        return (
            <TouchableOpacity 
                style={[
                    styles.lessonContainer, 
                    locked && styles.lockedBg,
                    !item?.isPublished && styles.draftBorder
                ]} 
                onPress={() => handleAction(item, 'quiz')}
            >
                <View style={styles.iconBox}>
                    <Ionicons 
                        name={locked ? "lock-closed" : (completed ? "checkmark-circle" : "ribbon")} 
                        size={22} 
                        color={locked ? "#999" : (completed ? "#4CAF50" : "purple")} 
                    />
                </View>
                <Text style={[
                    styles.lessonText, 
                    locked && styles.lockedText,
                    completed && { color: '#4CAF50' }
                ]}>
                    {item?.title} {completed && " (Passed)"}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
        );
    }

    return (
        <View style={styles.moduleWrapper}>
            <TouchableOpacity 
                style={[styles.moduleHeader, expanded && styles.expandedHeader]} 
                onPress={toggleExpand}
                activeOpacity={0.8}
            >
                <View style={styles.row}>
                    <View style={styles.moduleIconBox}>
                        <Ionicons name="folder-open" size={20} color="#fff" />
                    </View>
                    <Text style={styles.moduleTitle}>{item?.title}</Text>
                </View>
                <Ionicons 
                    name={expanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#666" 
                />
            </TouchableOpacity>

            {expanded && (
                <View style={styles.moduleContent}>
                    
                    {/* 1. Lessons (Videos/Articles) */}
                    {item?.lessons?.map((lesson) => (
                        <TouchableOpacity 
                            key={lesson._id} 
                            style={styles.nestedItem} 
                            onPress={() => handleAction(lesson, 'lesson')}
                        >
                            <Ionicons 
                                name={lesson.isLocked ? "lock-closed-outline" : (lesson.isCompleted ? "checkmark-circle" : "play-outline")} 
                                size={18} 
                                color={lesson.isLocked ? "#bbb" : (lesson.isCompleted ? "#4CAF50" : "#666")} 
                            />
                            <Text style={[styles.nestedText, lesson.isLocked && styles.lockedText]}>
                                {lesson.title}
                            </Text>
                            {lesson.isLocked === false && !isEnrolled && !isMentor && (
                                <View style={styles.freeBadge}><Text style={styles.freeText}>FREE</Text></View>
                            )}
                        </TouchableOpacity>
                    ))}

                    {/* 2. Module Quizzes - UPDATED FOR COMPLETION STATUS */}
                    {item?.quizzes?.map((quiz) => (
                        <TouchableOpacity 
                            key={quiz._id} 
                            style={styles.nestedItem} 
                            onPress={() => handleAction(quiz, 'quiz')}
                        >
                            <Ionicons 
                                name={quiz.isLocked ? "lock-closed-outline" : (quiz.isCompleted ? "checkmark-circle" : "help-circle-outline")} 
                                size={18} 
                                color={quiz.isLocked ? "#bbb" : (quiz.isCompleted ? "#4CAF50" : "purple")} 
                            />
                            <Text style={[
                                styles.nestedText, 
                                { color: quiz.isLocked ? '#bbb' : (quiz.isCompleted ? '#4CAF50' : 'purple') }
                            ]}>
                                {quiz.title} {quiz.isCompleted && "(Passed)"}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {isMentor && (
                        <View style={styles.addActions}>
                            <Text style={styles.actionHint}>Add to Module:</Text>
                            <View style={styles.actionRow}>
                                <TouchableOpacity style={styles.miniBtn} onPress={() => onAddContent(item._id, 'video')}>
                                    <Ionicons name="videocam" size={12} color="#2196F3" />
                                    <Text style={styles.miniBtnText}>Video</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.miniBtn} onPress={() => onAddContent(item._id, 'blog')}>
                                    <Ionicons name="document-text" size={12} color="#2196F3" />
                                    <Text style={styles.miniBtnText}>Article</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.miniBtn} onPress={() => onAddContent(item._id, 'quiz')}>
                                    <Ionicons name="help-circle" size={12} color="#2196F3" />
                                    <Text style={styles.miniBtnText}>Quiz</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    lessonContainer: { flexDirection: 'row', alignItems: 'center', padding: 16, marginHorizontal: 20, marginVertical: 6, backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#eee', elevation: 2 },
    lockedBg: { backgroundColor: '#f9f9f9', borderColor: '#f0f0f0' },
    draftBorder: { borderStyle: 'dashed', borderColor: '#ffb74d' },
    iconBox: { width: 35 },
    lessonText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#333' },
    lockedText: { color: '#bbb' },
    moduleWrapper: { marginHorizontal: 20, marginVertical: 8, borderRadius: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e3f2fd', overflow: 'hidden' },
    moduleHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 16, alignItems: 'center' },
    expandedHeader: { backgroundColor: '#f0f7ff' },
    row: { flexDirection: 'row', alignItems: 'center' },
    moduleIconBox: { width: 32, height: 32, borderRadius: 8, backgroundColor: '#2196F3', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
    moduleTitle: { fontSize: 16, fontWeight: 'bold', color: '#1976D2' },
    moduleContent: { paddingHorizontal: 16, paddingBottom: 16 },
    nestedItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
    nestedText: { marginLeft: 12, flex: 1, fontSize: 15, color: '#555', fontWeight: '500' },
    freeBadge: { backgroundColor: '#E8F5E9', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
    freeText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
    addActions: { marginTop: 15, paddingTop: 15, borderTopWidth: 1, borderTopColor: '#e3f2fd' },
    actionHint: { fontSize: 10, fontWeight: 'bold', color: '#999', textTransform: 'uppercase', marginBottom: 10 },
    actionRow: { flexDirection: 'row' },
    miniBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 5, paddingHorizontal: 10, borderRadius: 15, borderWidth: 1, borderColor: '#2196F3', marginRight: 8 },
    miniBtnText: { marginLeft: 4, fontSize: 11, color: '#2196F3', fontWeight: 'bold' }
});

export default CurriculumItem;