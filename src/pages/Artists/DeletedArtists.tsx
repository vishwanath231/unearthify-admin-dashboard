import DeletedArtists from "../../components/Artists/DeletedArtists";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";

export default function ArtistSubmissions() {
  return (
    <div>
      <PageMeta title="Deleted Artist" description="" />
      <PageBreadcrumb pageTitle="Deleted Artist" />
      <DeletedArtists/>
    </div>
  );
}