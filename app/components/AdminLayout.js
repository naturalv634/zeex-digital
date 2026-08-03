export default function AdminLayout({ children, title }) {
    return (
        <div style={{ padding: "20px" }}>
            {title && <h1>{title}</h1>}
            {children}
        </div>
    );
}