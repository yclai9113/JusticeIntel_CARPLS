import PageContainer from "../components/PageContainer";

function ContactPage() {
  return (
    <PageContainer>
    <div>
      <h1>Contact</h1>
      <p>Please contact Andrew Sharp from {" "}
        <a href="https://carpls.org/" target="_blank" rel="noopener noreferrer">
          CARPLS
        </a> at {" "} 
        <a href="mailto:asharp@carpls.org">
          asharp@carpls.org
        </a> if you have any questions or concerns.</p>
    </div>
    </PageContainer>
  );
}

export default ContactPage;