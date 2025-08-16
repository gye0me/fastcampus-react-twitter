import { Route, Routes, Navigate } from "react-router-dom";

// 페이지 컴포넌트
import HomePage from "pages/home";
import PostListPage from "pages/posts";
import PostDetail from "pages/posts/detail";
import PostNew from "pages/posts/new"; 
import ProfilePage from "pages/profile";
import ProfileEdit from "pages/profile/edit"; 
import SearchPage from "pages/search";
import NotificationsPage from "pages/notifications";
import LoginForm from "components/users/LoginForm";
import SignupForm from "components/users/SignupForm";
import LoginPage from "pages/users/login";
import SignupPage from "pages/users/signup";
import PostEditForm from "components/posts/PostEditForm"

interface RouterProps {
isAuthenticated: boolean;
}

export default function Router({ isAuthenticated }: RouterProps) {
return (
    <Routes>
    {isAuthenticated ? (
        <>
            <Route path="/" element={<HomePage />} />
            <Route path="/posts" element={<PostListPage />} />
            <Route path="/posts/:id" element={<PostDetail />} />
            <Route path="/posts/new" element={<PostNew />} />
            <Route path="/posts/edit/:id" element={<PostEditForm />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEdit />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="*" element={<Navigate replace to="/" />} />
        </>
    ) : (
        <>
            <Route path="/users/login" element={<LoginPage />} />
            <Route path="/users/signup" element={<SignupPage />} />
            <Route path="*" element={<Navigate to="/users/login" replace />} />
        </>
    )}
    </Routes>
);
}