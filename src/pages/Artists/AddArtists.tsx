import AddArtists from "../../components/Artists/AddArtists";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function Artists() {
  return (
    <div>
      <PageMeta
        title="Unearthify-Add Artist"
        description=""
      />
      <PageBreadcrumb pageTitle="Add Artists" />
          <AddArtists/>
    </div>
  );
}