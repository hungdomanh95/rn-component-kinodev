import { StyleSheet } from "react-native";
import { colors, sizes } from "../../theme";

const WIDTH_CONTAINER_MULTI = sizes.screenWidth - 6 * sizes.spacing;
const SIZE_ITEM_MULTI = WIDTH_CONTAINER_MULTI / 3 - 1;

export const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(24, 68, 120, 0.5)",
    paddingHorizontal: sizes.spacing,
    paddingTop: sizes.spacing,
    marginBottom: sizes.spacing,
  },
  content: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: sizes.spacing,
    marginTop: sizes.spacing,
  },
  containerSingle: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  itemUpload: {
    width: SIZE_ITEM_MULTI,
    height: SIZE_ITEM_MULTI,
    borderWidth: 1,
    borderColor: "rgba(24, 68, 120, 0.5)",
    borderStyle: "dashed",
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: sizes.spacing,
    padding: 8,
    backgroundColor: colors.lightGray,
  },
  buttonRemove: {
    position: "absolute",
    zIndex: 1,
    right: 5,
    top: 5,
    borderRadius: 50,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  viewPDF: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
  },
  viewIMAGE: {
    position: "absolute",
    top: 0,
    right: 0,
    left: 0,
    bottom: 0,
    borderRadius: 6,
  },
  nameFile: {
    fontSize: 10,
    color: colors.white,
    textAlign: "center",
    paddingHorizontal: 4,
    position: "absolute",
    bottom: 4,
    left: 0,
    right: 0,
  },
  textCount: {
    fontSize: 12,
    color: colors.gray,
  },
});
