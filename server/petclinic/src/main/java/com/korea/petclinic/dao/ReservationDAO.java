package com.korea.petclinic.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import com.korea.petclinic.vo.ReservationStatusCountVO;
import com.korea.petclinic.vo.ReservationVO;

@Mapper
public interface  ReservationDAO {

	List<ReservationVO> findAll();
	
	ReservationVO findById(@Param("id") Long id);
	
	int insert(ReservationVO reservation);
	
	int update(ReservationVO reservation);
	
	int delete(@Param("id") Long id);
	
	List<ReservationVO> searchDetail(
			@Param("searchType") String searchType,
			@Param("keyword") String keyword);
	
	List<ReservationVO> sortByprice(@Param("sort") String sort);
	
	List<ReservationStatusCountVO> countByStatus();
}
