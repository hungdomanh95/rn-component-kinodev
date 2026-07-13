import { useFormikContext } from "formik";
import { useAppDispatch, useAppSelector } from "hooks/redux";
import React, { useEffect, useRef, useState } from "react";
import AddressService from "services/address.service";
import { getAllProvince } from "stores/province";
import { SelectOption } from "../Select/Select";
import SelectField from "../Select/SelectField";

export type AddressItem = {
  id: number | string;
  name: string;
  zip_code?: string;
};

export interface AddressFieldsProps {
  /**
   * Prefix mode: "per" → perProvinceId, perDistrictId, perWardId, perZipcode
   */
  prefix?: string;
  /**
   * Name mode (dot-notation): "addressDelivery" → addressDelivery.provinceId, addressDelivery.districtId, addressDelivery.wardId, addressDelivery.zipCode
   */
  name?: string;
  /**
   * Tên hiển thị ngay khi vào — không cần gọi API.
   * Nếu không truyền nhưng id tồn tại → tự resolve (xem từng case bên dưới).
   */
  initialProvinceName?: string;
  initialDistrictName?: string;
  initialWardName?: string;
  disabled?: boolean;
}

type Cache = Record<string, SelectOption[]>;

// Module-level cache — tồn tại xuyên suốt session, không reset khi component unmount/remount
const districtCacheGlobal: Cache = {};
const wardCacheGlobal: Cache = {};

const toOptions = (list: any[]): SelectOption[] =>
  list.map(item => ({ value: item.id, label: item.name, data: item }));

const seedOption = (id: any, name?: string): SelectOption[] =>
  id != null && name ? [{ value: id, label: name }] : [];

const AddressFields: React.FC<AddressFieldsProps> = ({
  prefix,
  name,
  initialProvinceName,
  initialDistrictName,
  initialWardName,
  disabled,
}) => {
  const dispatch = useAppDispatch();
  const { values, setFieldValue } = useFormikContext<any>();

  // Province list từ Redux — không gọi API nếu đã có
  const listProvince = useAppSelector((state: any) => state.province.listProvince ?? []);
  const sourceSystem = useAppSelector((state: any) => state.package.sourceSystem);

  const f = {
    provinceId:   name ? `${name}.provinceId`   : `${prefix}ProvinceId`,
    districtId:   name ? `${name}.districtId`   : `${prefix}DistrictId`,
    wardId:       name ? `${name}.wardId`       : `${prefix}WardId`,
    zipCode:      name ? `${name}.zipCode`      : `${prefix}Zipcode`,
    provinceName: name ? `${name}.provinceName` : `${prefix}ProvinceName`,
    districtName: name ? `${name}.districtName` : `${prefix}DistrictName`,
    wardName:     name ? `${name}.wardName`     : `${prefix}WardName`,
  };

  const pId = name ? values[name]?.provinceId : values[`${prefix}ProvinceId`];
  const dId = name ? values[name]?.districtId : values[`${prefix}DistrictId`];
  const wId = name ? values[name]?.wardId     : values[`${prefix}WardId`];


  /**
   * Case 3: có id nhưng không có name
   * Province → resolve ngay từ Redux store (đồng bộ, không cần API)
   * District/Ward → fetch on mount (xem useEffect bên dưới)
   */
  const resolvedProvinceName =
    initialProvinceName ||
    (pId ? listProvince.find((p: any) => String(p.id) === String(pId))?.name : undefined);

  const [provinceOptions, setProvinceOptions] = useState<SelectOption[]>(
    () => seedOption(pId, resolvedProvinceName)
  );
  const [districtOptions, setDistrictOptions] = useState<SelectOption[]>(
    () => seedOption(dId, initialDistrictName)
  );
  const [wardOptions, setWardOptions] = useState<SelectOption[]>(
    () => seedOption(wId, initialWardName)
  );

  const [provinceLoading, setProvinceLoading] = useState(false);
  const [districtLoading, setDistrictLoading] = useState(false);
  const [wardLoading, setWardLoading] = useState(false);

  // Dùng ref để tránh gọi API trùng lặp
  const provinceLoaded = useRef(false);
  const districtCache = districtCacheGlobal;
  const wardCache = wardCacheGlobal;

  const currentProvinceId = useRef(pId);
  const currentDistrictId = useRef(dId);

  // Sync resolved province name vào Formik nếu có id nhưng Formik value đang trống
  useEffect(() => {
    if (resolvedProvinceName) {
      const currentProvName = name ? values[name]?.provinceName : values[`${prefix}ProvinceName`];
      if (!currentProvName) setFieldValue(f.provinceName, resolvedProvinceName);
    }
    if (dId && !initialDistrictName) loadDistricts();
    if (wId && !initialWardName) loadWards();
  }, []);

  // Seed options khi id thay đổi từ bên ngoài (e.g. parent gọi setValues/setFieldValue)
  const pName = name ? values[name]?.provinceName : values[`${prefix}ProvinceName`];
  const dName = name ? values[name]?.districtName : values[`${prefix}DistrictName`];
  const wName = name ? values[name]?.wardName     : values[`${prefix}WardName`];

  useEffect(() => {
    if (pId) {
      currentProvinceId.current = pId;
      if (pName && !provinceOptions.find(o => String(o.value) === String(pId))) {
        setProvinceOptions([{ value: pId, label: pName }]);
      }
    }
  }, [pId]);

  useEffect(() => {
    if (dId) {
      currentDistrictId.current = dId;
      if (dName && !districtOptions.find(o => String(o.value) === String(dId))) {
        setDistrictOptions([{ value: dId, label: dName }]);
      }
    }
  }, [dId]);

  useEffect(() => {
    if (wId) {
      if (wName && !wardOptions.find(o => String(o.value) === String(wId))) {
        setWardOptions([{ value: wId, label: wName }]);
      }
    }
  }, [wId]);

  // Province: ưu tiên Redux store, chỉ gọi API nếu store trống
  const loadProvinces = async () => {
    if (provinceLoaded.current || provinceLoading) return;
    provinceLoaded.current = true;
    setProvinceLoading(true);
    if (listProvince.length > 0) {
      setProvinceOptions(toOptions(listProvince));
    } else {
      const result = await dispatch(getAllProvince({ sourceSystem })).unwrap();
      setProvinceOptions(toOptions(result));
    }
    setProvinceLoading(false);
  };

  // District: cache theo provinceId — không gọi lại API nếu đã có
  const loadDistricts = async () => {
    const id = String(currentProvinceId.current ?? "");
    if (!id) return;
    if (districtCache[id]) {
      setDistrictOptions(districtCache[id]);
      return;
    }
    setDistrictLoading(true);
    const list = await AddressService.getDistrictList(id);
    const opts = toOptions(list);
    districtCache[id] = opts;
    setDistrictOptions(opts);
    setDistrictLoading(false);
  };

  // Ward: cache theo districtId
  const loadWards = async () => {
    const id = String(currentDistrictId.current ?? "");
    if (!id) return;
    if (wardCache[id]) {
      setWardOptions(wardCache[id]);
      return;
    }
    setWardLoading(true);
    const list = await AddressService.getWardList(id);
    const opts = toOptions(list);
    wardCache[id] = opts;
    setWardOptions(opts);
    setWardLoading(false);
  };

  const onProvinceChange = (val: any, option: any) => {
    currentProvinceId.current = val;
    currentDistrictId.current = null;
    setFieldValue(f.provinceName, option?.label ?? '');
    setFieldValue(f.districtId, null);
    setFieldValue(f.districtName, '');
    setFieldValue(f.wardId, null);
    setFieldValue(f.wardName, '');
    setDistrictOptions([]);
    setWardOptions([]);
  };

  const onDistrictChange = (val: any, option: any) => {
    currentDistrictId.current = val;
    setFieldValue(f.districtName, option?.label ?? '');
    setFieldValue(f.wardId, null);
    setFieldValue(f.wardName, '');
    setWardOptions([]);
  };

  return (
    <>
      <SelectField
        name={f.provinceId}
        label="Tỉnh/Thành Phố"
        isRequired
        options={provinceOptions}
        placeholder="-- Vui lòng chọn tỉnh/thành --"
        searchable
        disabled={disabled}
        loading={provinceLoading}
        onOpen={loadProvinces}
        onValueChange={onProvinceChange}
      />
      <SelectField
        name={f.districtId}
        label="Quận/Huyện"
        isRequired
        options={districtOptions}
        placeholder="-- Vui lòng chọn quận/huyện --"
        searchable
        disabled={!pId || disabled}
        loading={districtLoading}
        onOpen={loadDistricts}
        onValueChange={onDistrictChange}
      />
      <SelectField
        name={f.wardId}
        label="Phường/Xã"
        isRequired
        options={wardOptions}
        placeholder="-- Vui lòng chọn phường/xã --"
        searchable
        disabled={!dId || disabled}
        loading={wardLoading}
        onOpen={loadWards}
        onValueChange={(_val, option: any) => {
          setFieldValue(f.wardName, option?.label ?? '');
          setFieldValue(f.zipCode, option?.data?.zip_code);
        }}
      />
    </>
  );
};

export default AddressFields;
