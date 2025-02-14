type JSONSchema = {
  type?: string
  properties?: Record<string, JSONSchema>
  required?: string[]
  enum?: any[]
  items?: JSONSchema
  oneOf?: JSONSchema[]
  // (Extend this type as needed to support other JSON Schema keywords.)
}

/**
 * Checks whether the `provided` schema “fulfills” the `required` schema.
 *
 * In our simplified version, for each key in the required schema:
 * - If a type is specified, the provided schema must have the same type.
 * - For object types, every property that is required in the required schema must exist
 *   in the provided schema and itself be compatible.
 * - For arrays, the provided schema’s “items” must be compatible with the required “items.”
 * - For enums, every value required must be included in the provided enum.
 * - For oneOf, each option in the required schema must have at least one matching option in the provided schema.
 *
 * The rules for combinators (We do not support anyOf or allOf)
 * - oneOf (required): The provided schema must validate against at least one option.
 * - oneOf (provided only): Each provided option must fulfill the required schema.
 *
 *
 * @param provided - The schema from your providedDTO.
 * @param required - The schema from your requiredDTO.
 * @returns true if the provided schema fulfills the required schema; false otherwise.
 */
export function schemaFulfills(provided: JSONSchema, required: JSONSchema): boolean {
  // ----- Handle combinators in the required schema first -----
  if (required.oneOf) {
    // If the required schema has a oneOf,
    // the provided schema must match at least one of the sub-schemas.
    if (provided.oneOf) {
      // If both use oneOf, then every provided option must match at least one required option.
      for (const provOption of provided.oneOf) {
        let matched = false
        for (const reqOption of required.oneOf) {
          if (schemaFulfills(provOption, reqOption)) {
            matched = true
            break
          }
        }
        if (!matched) return false
      }
    } else {
      // Provided does not use oneOf, so check if it matches at least one of the required options.
      let matched = false
      for (const reqOption of required.oneOf) {
        if (schemaFulfills(provided, reqOption)) {
          matched = true
          break
        }
      }
      if (!matched) return false
    }
  } else if (provided.oneOf && !required.oneOf) {
    // Provided has oneOf but required does not.
    // Then every option in provided.oneOf must fulfill the required schema.
    for (const provOption of provided.oneOf) {
      if (!schemaFulfills(provOption, required)) return false
    }
  }

  // ----- Now check the basic keywords -----

  // Check the "type" (if specified in required).
  if (required.type) {
    if (provided.type !== required.type) {
      return false
    }
  }

  // Check "properties" for object types.
  if (required.properties) {
    if (!provided.properties) return false
    // Use the "required" array if provided; otherwise, all properties in required.properties.
    const requiredProps = required.required || Object.keys(required.properties)
    for (const prop of requiredProps) {
      if (!(prop in provided.properties)) return false
      if (!schemaFulfills(provided.properties[prop], required.properties[prop])) {
        return false
      }
    }
  }

  // Check "items" for array types.
  if (required.type === 'array') {
    if (!provided.items || !required.items) return false
    if (!schemaFulfills(provided.items, required.items)) return false
  }

  // enum defines which values are allowed.
  // Check enum values: every value in provided.enum must appear in required.enum.
  if (required.enum) {
    // no required enum means no restrictions
    if (!provided.enum) return false
    for (const val of provided.enum) {
      if (!required.enum.includes(val)) return false
    }
  }

  // (You can extend this function to check additional keywords as needed.)
  return true
}
