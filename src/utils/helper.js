const getCountForQuery = async (queryBuilder) => {
  try {
    const countResult = await queryBuilder.count("* as total_count");
    console.log(countResult, 5);
    return countResult.total_count;
  } catch (error) {
    throw new Error("Error fetching count");
  }
};

export { getCountForQuery };
