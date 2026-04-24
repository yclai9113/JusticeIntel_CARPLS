function PageContainer({ children }) {
  return (
    <div
      style={{
        margin: "0 auto",
        paddingLeft: "20px",
        paddingRight: "20px",
      }}
    >
      {children}
    </div>
  );
}

export default PageContainer;