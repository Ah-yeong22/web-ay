package com.korea.ex_0722.dao;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.korea.ex_0722.vo.UserVO;

@Mapper
public interface UserDAO {

	List<UserVO> findAll();

	int insert(UserVO user);

	UserVO findAll(Long id);
}
