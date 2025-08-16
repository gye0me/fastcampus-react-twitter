import { useCallback, useContext, useEffect, useState } from "react";

import PostForm from "../../components/posts/PostForm";
import PostBox from "../../components/posts/PostBox";

import useTranslation from "hooks/useTranslation";

import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    orderBy, 
    doc,
} from "firebase/firestore";
import AuthContext from "context/AuthContext";
import { db } from "firebaseApp";

export interface PostProps {
    id: string;
    email: string;
    content: string;
    createdAt: string;
    uid: string;
    profileUrl?: string;
    likes?: string[];
    likeCount?: number;
    comments?: any;
    hashTags?: string[];
    imageUrl?: string;
}

interface UserProps {
    id: string;
}

type tabType = "all" | "following";

export default function HomePage() {
    const [posts, setPosts] = useState<PostProps[]>([]);
    const [followingPosts, setFollowingPosts] = useState<PostProps[]>([]);
    const [followingIds, setFollowingIds] = useState<string[]>([]);
    const [activeTab, setActiveTab] = useState<tabType>("all");
    const { user } = useContext(AuthContext);
    const t = useTranslation();

    const getFollowingIds = useCallback(() => {
        if (user?.uid) {
            const ref = doc(db, "following", user.uid);
            return onSnapshot(ref, (docSnap) => {
                if (docSnap.exists()) {
                    const users = (docSnap.data()?.users as UserProps[]) || [];
                    const ids = users.map(user => user.id);
                    setFollowingIds(ids);
                } else {
                    setFollowingIds([]);
                }
            });
        }
    }, [user?.uid]);

    useEffect(() => {
        if (!user) return;

        const postsRef = collection(db, "posts");

        // 모든 게시글 쿼리
        const postsQuery = query(postsRef, orderBy("createdAt", "desc"));

        // followingIds가 빈 배열이면 where 절에 오류 발생하므로 조건 분기 필요
        let followingUnsubscribe = () => {};
        if (followingIds.length > 0) {
            const followingQuery = query(
                postsRef,
                where("uid", "in", followingIds),
                orderBy("createdAt", "desc")
            );
            followingUnsubscribe = onSnapshot(followingQuery, (snapshot) => {
                const dataObj = snapshot.docs.map(doc => ({
                    ...doc.data(),
                    id: doc.id,
                })) as PostProps[];
                setFollowingPosts(dataObj);
            });
        } else {
            // followingIds가 없으면 빈 배열로 초기화
            setFollowingPosts([]);
        }

        const postsUnsubscribe = onSnapshot(postsQuery, (snapshot) => {
            const dataObj = snapshot.docs.map(doc => ({
                ...doc.data(),
                id: doc.id,
            })) as PostProps[];
            setPosts(dataObj);
        });

        return () => {
            postsUnsubscribe();
            followingUnsubscribe();
        };
    }, [user, followingIds]);

    useEffect(() => {
        if (user?.uid) {
            const unsubscribe = getFollowingIds();
            return () => unsubscribe && unsubscribe();
        }
    }, [getFollowingIds, user?.uid]);

    return (
        <div className="home">
            <div className="home__top">
                <div className="home__title">{t("MENU_HOME")}</div>
                <div className="home__tabs">
                    <div 
                        className={`home__tab ${activeTab === "all" ? "home__tab--active" : ""}`}
                        onClick={() => setActiveTab("all")}
                    >
                        {t("TAB_ALL")}
                    </div>
                    <div 
                        className={`home__tab ${activeTab === "following" ? "home__tab--active" : ""}`}
                        onClick={() => setActiveTab("following")}
                    >
                        {t("TAB_FOLLOWING")}
                    </div>
                </div>
            </div>
            <PostForm />
            {activeTab === "all" && (
                <div className="post">
                    {posts.length > 0 ? (
                        posts.map((post) => <PostBox post={post} key={post.id} />)
                    ) : (
                        <div className="post__no-posts">
                            <div className="post__text">{t("NO_POSTS")}</div>
                        </div>
                    )}
                </div>
            )}
            {activeTab === "following" && (
                <div className="post">
                    {followingPosts.length > 0 ? (
                        followingPosts.map((post) => <PostBox post={post} key={post.id} />)
                    ) : (
                        <div className="post__no-posts">
                            <div className="post__text">{t("NO_POSTS")}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}